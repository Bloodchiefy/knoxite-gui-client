package main

import (
	"context"
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"strconv"
	"syscall"
	"time"

	shutdown "github.com/klauspost/shutdown2"
	"github.com/knoxite/knoxite"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	repository   *knoxite.Repository
	volume       *knoxite.Volume
	volumeID     string
	progressHook <-chan knoxite.Progress
	items        uint64
	cancel       shutdown.Notifier
	interrupt    chan bool
)

// File struct
type FileForUI struct {
	Key        string `json:"key"`
	Modified   string `json:"modified"`
	Size       string `json:"size"`
	User       string `json:"user"`
	Group      string `json:"group"`
	Mode       string `json:"mode"`
	Data       []byte `json:"data"`
	IsDir      bool   `json:"isDir"`
	SnapshotID string `json:"snapID"`
	VolumeID   string `json:"volID"`
}

type ProgressUI struct {
	knoxite.Stats
	Items uint64 `json:"items"`
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) loadRepository() (*knoxite.Repository, error) {
	if globalOpts.Repo != "" {
		repo, err := knoxite.OpenRepository(globalOpts.Repo, globalOpts.Password)

		if err != nil {
			return &knoxite.Repository{}, fmt.Errorf("couldn't load repository")
		}

		return &repo, nil
	}

	return &knoxite.Repository{}, fmt.Errorf("couldn't load repository")
}

func (a *App) Store(volID string, targets []string) {
	// cancel = make(chan bool)
	// contx, cncl = context.WithCancel(context.Background())
	// defer cncl()
	// go func() {
	// 	executeStore(volID, targets, StoreOptions{})
	// }()
	cancel = shutdown.First()
	// defer close(cancel)
	executeStore(volID, targets, StoreOptions{})
}

func (a *App) Restore(snapID, target string) {
	go func() {
		executeRestore(snapID, target, RestoreOptions{})
	}()
}

// func (a *App) GetProgressItems() int64 {
// 	return items
// }

func (a *App) GetProgress() ProgressUI {
	if progressHook != nil {
		p := <-progressHook
		stats := p.TotalStatistics
		statsItems := uint64(stats.Dirs + stats.Files + stats.SymLinks)
		if statsItems == items {
			return ProgressUI{stats, statsItems}
		}
		return ProgressUI{p.TotalStatistics, items}
	} else {
		return ProgressUI{knoxite.Stats{}, 0}
	}
}

func (a *App) Cancel() {
	fmt.Println("Cancel")

	// go shutdown.Shutdown()
	// go func() {
	// 	cancel <- true
	// 	close(progressHook)
	// }()
	// close(progressHook)
	// close(cancel)
	// shutdown.CancelCtxN(a.ctx, shutdown.Stage{1})
	interrupt <- true
	// cancel <- struct{}{}
	// cancel.Cancel()
	// shutdown.CancelCtxN(a.ctx, shutdown.Stage1)
	// syscall.Kill(syscall.Getpid(), syscall.SIGTERM)

	// syscall.Kill(syscall.Getpid(), syscall.SIGINT)
	fmt.Println("Cancel tried")

}

// func (a *App) GetProgress() string {
// 	wd, _ := os.Getwd()
// 	f, _ := os.Open(filepath.Join(wd, "progress.log"))
// 	line := ""
// 	var cursor int64 = 0
// 	stat, _ := f.Stat()
// 	filesize := stat.Size()
// 	for {
// 		cursor -= 1
// 		f.Seek(cursor, io.SeekEnd)

// 		char := make([]byte, 1)
// 		f.Read(char)

// 		if cursor != -1 && (char[0] == 10 || char[0] == 13) { // stop if we find a line
// 			break
// 		}

// 		line = fmt.Sprintf("%s%s", string(char), line) // there is more efficient way

// 		if cursor == -filesize { // stop if we are at the begining
// 			break
// 		}
// 	}

// 	return line
// }

func (a *App) OpenSnapshot(snapID string) (files []FileForUI) {
	snapshot, err := volume.LoadSnapshot(snapID, repository)
	if err == nil {
		for _, archive := range snapshot.Archives {
			username := strconv.FormatInt(int64(archive.UID), 10)
			u, err := user.LookupId(username)
			if err == nil {
				username = u.Username
			}
			groupname := strconv.FormatInt(int64(archive.GID), 10)
			file := &FileForUI{
				Modified:   time.Unix(archive.ModTime, 0).Format(timeFormat),
				Key:        archive.Path,
				Mode:       archive.Mode.String(),
				User:       username,
				Group:      groupname,
				Size:       knoxite.SizeToString(archive.Size),
				IsDir:      archive.Type == knoxite.Directory,
				SnapshotID: snapID,
				VolumeID:   volume.ID,
			}
			files = append(files, *file)
		}
	}

	return
}

func (a *App) OpenAllSnapshots() (files []FileForUI) {
	for _, snapshotID := range volume.Snapshots {
		snapshot, err := volume.LoadSnapshot(snapshotID, repository)
		if err == nil {
			for _, archive := range snapshot.Archives {
				username := strconv.FormatInt(int64(archive.UID), 10)
				u, err := user.LookupId(username)
				if err == nil {
					username = u.Username
				}
				groupname := strconv.FormatInt(int64(archive.GID), 10)
				file := &FileForUI{
					Modified:   time.Unix(archive.ModTime, 0).Format(timeFormat),
					Key:        archive.Path,
					Mode:       archive.Mode.String(),
					User:       username,
					Group:      groupname,
					Size:       knoxite.SizeToString(archive.Size),
					IsDir:      archive.Type == knoxite.Directory,
					SnapshotID: snapshotID,
					VolumeID:   volume.ID,
				}
				files = append(files, *file)
			}
		}
	}

	return
}

func (a *App) GetSnapshots() (snapshots [][]string) {
	repository, _ = a.loadRepository()
	volume, _ = repository.FindVolume(volumeID)
	for _, snapID := range volume.Snapshots {
		_, snapshot, err := repository.FindSnapshot(snapID)
		if err == nil {
			snapshots = append(snapshots, []string{
				snapshot.ID,
				snapshot.Description,
				time.Unix(snapshot.Date.Unix(), 0).Format(timeFormat),
			})
		}
	}

	return
}

func (a *App) DeleteSnapshot(snapID string) string {
	err := executeSnapshotRemove(snapID)
	if err != nil {
		return err.Error()
	}

	if err = executeRepoPack(); err != nil {
		return err.Error()
	}

	return ""
}

func (a *App) OpenVolume(volID string) (err error) {
	repository, err = a.loadRepository()
	if err != nil {
		return err
	}
	volumeID = volID
	volume, err = repository.FindVolume(volumeID)
	if err != nil {
		return err
	}

	return nil
}

func (a *App) CreateVolume(name, description string) error {
	_, err := executeVolumeInit(name, description)
	if err != nil {
		return err
	}

	return nil
}

func (a *App) DeleteVolume(volID string) string {
	err := executeVolumeRemove(volID)
	if err != nil {
		return err.Error()
	}

	return ""
}

func (a *App) GetVolumes() (volumes [][]string) {
	repository, err := a.loadRepository()
	if err != nil {
		return volumes
	}

	for _, vol := range repository.Volumes {
		volumes = append(volumes, []string{vol.ID, vol.Name, vol.Description})
	}

	return
}

func (a *App) OpenDirectory() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		DefaultDirectory: home,
		Title:            "Select Folder",
	})

	if err != nil {
		return ""
	}
	return selection
}

func (a *App) InitConfigOnAlias(alias, password string) string {
	globalOpts.Alias = alias
	globalOpts.Password = password

	if err := initConfig(); err != nil {
		return err.Error()
	}

	if _, err := openRepository(globalOpts.Repo, globalOpts.Password); err != nil {
		return err.Error()
	}

	return ""
}

func (a *App) InitConfiguration(repo, password, alias string) error {
	initGlobalOpts(repo, password, 1)
	if err := initConfig(); err != nil {
		return err
	}
	if err := executeConfigAlias(alias); err != nil {
		return err
	}
	if _, err := knoxite.OpenRepository(repo, password); err != nil {
		return executeRepoInit()
	}
	return nil
}

func (a *App) InitGlobalOptsOnExistingConfig() (aliases []string) {
	globalOpts.ConfigURL = filepath.Join(currentDirectory, "knoxite.conf")
	initConfig()
	for alias := range cfg.Repositories {
		aliases = append(aliases, alias)
	}
	return
}

type Exploration struct {
	Entries []ExplorationEntry `json:"entries"`
	Path    string             `json:"path"`
}

type ExplorationEntry struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	IsDir    bool   `json:"isDir"`
	Size     string `json:"size"`
	User     string `json:"user"`
	Group    string `json:"group"`
	Mode     string `json:"mode"`
	Modified string `json:"modified"`
}

func (a *App) Explore(path string) (e Exploration) {
	if len(path) == 0 {

		u, err := user.Current()
		if err != nil {
			return
		}
		path = u.HomeDir
	}

	files, err := os.ReadDir(path)
	if err != nil {
		return
	}

	e.Path = path

	if filepath.Dir(path) != path {
		e.Entries = append(e.Entries, ExplorationEntry{
			Name:  "..",
			Path:  filepath.Dir(path),
			IsDir: true,
		})
	}

	for _, f := range files {
		if f.IsDir() {
			e.Entries = append(e.Entries, ExplorationEntry{
				Name:  f.Name(),
				Path:  filepath.Join(path, f.Name()),
				IsDir: f.IsDir(),
			})
		}
	}

	for _, f := range files {
		if !f.IsDir() {
			fsinfo, err := f.Info()
			if err == nil {
				p := filepath.Join(path, f.Name())
				info, err := os.Stat(p)
				if err == nil {
					var UID int
					var GID int
					if stat, ok := info.Sys().(*syscall.Stat_t); ok {
						UID = int(stat.Uid)
						GID = int(stat.Gid)
					} else {
						UID = os.Getuid()
						GID = os.Getgid()
					}

					username := strconv.FormatInt(int64(UID), 10)
					u, err := user.LookupId(username)
					if err == nil {
						username = u.Username
					}
					groupname := strconv.FormatInt(int64(GID), 10)
					e.Entries = append(e.Entries, ExplorationEntry{
						Name:  f.Name(),
						Path:  p,
						IsDir: f.IsDir(),
						Mode:  fsinfo.Mode().String(),
						User:  username,
						Group: groupname,
						Size:  knoxite.SizeToString(uint64(info.Size())),
					})
				}
			}
		}
	}

	return
}
