package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	// _ "../knoxite/storage/http" // needs to be replaced with the github path
	"github.com/BurntSushi/toml"
	shutdown "github.com/klauspost/shutdown2"
	"github.com/knoxite/knoxite"
	"github.com/knoxite/knoxite/cmd/knoxite/config"
	"github.com/knoxite/knoxite/cmd/knoxite/utils"
	"github.com/muesli/gotable"
	// _ "github.com/knoxite/knoxite/storage/amazons3"
	// _ "github.com/knoxite/knoxite/storage/azure"
	// _ "github.com/knoxite/knoxite/storage/backblaze"
	// _ "github.com/knoxite/knoxite/storage/dropbox"
	// _ "github.com/knoxite/knoxite/storage/ftp"
	// _ "github.com/knoxite/knoxite/storage/googlecloud"
	// _ "github.com/knoxite/knoxite/storage/mega"
	// _ "github.com/knoxite/knoxite/storage/s3"
	// _ "github.com/knoxite/knoxite/storage/sftp"
	// _ "github.com/knoxite/knoxite/storage/webdav"
)

type GlobalOptions struct {
	Repo      string
	Alias     string
	Password  string
	ConfigURL string
	Verbose   int
}

type RestoreOptions struct {
	Excludes []string
	Pedantic bool
}

type VolumeInitOptions struct {
	Description string
}

type VerifyOptions struct {
	Percentage int
}

type StoreOptions struct {
	Description      string
	Compression      string
	Encryption       string
	FailureTolerance uint
	Excludes         []string
	Pedantic         bool
}

const timeFormat = "2006-01-02 15:04:05"

var (
	globalOpts = GlobalOptions{}
	cfg        = &config.Config{}
	// restoreOpts    = RestoreOptions{}
	// storeOpts      = StoreOptions{}
	// volumeInitOpts = VolumeInitOptions{}

	ErrRedundancyAmount = errors.New("failure tolerance can't be equal or higher as the number of storage backends")
	currentDirectory, _ = os.Getwd()
	l                   *log.Logger
)

func initGlobalOpts(repo, password string, verbose int) {
	globalOpts.Repo = repo
	globalOpts.Password = password
	globalOpts.ConfigURL = filepath.Join(currentDirectory, "knoxite.conf")
	globalOpts.Verbose = verbose

	// globalOpts.Repo = os.Getenv("KNOXITE_REPOSITORY")
	// globalOpts.Password = os.Getenv("KNOXITE_PASSWORD")
}

func initConfig() error {
	var err error
	cfg, err = config.New(globalOpts.ConfigURL)
	if err != nil {
		// l.Fatalf("Error reading the config file: %v", err)
		return err
	}

	if err = cfg.Load(); err != nil {
		// l.Fatalf("Error parsing the toml config file at '%s': %v", cfg.URL().Path, err)
		return err
	}

	// There can occur a panic due to an entry assigment in nil map when theres
	// no map initialized to store the RepoConfigs. This will prevent this from
	// happening:
	if cfg.Repositories == nil {
		cfg.Repositories = make(map[string]config.RepoConfig)
	}

	if globalOpts.Alias != "" {
		rep, ok := cfg.Repositories[globalOpts.Alias]
		if !ok {
			// l.Fatalf("Error loading the specified alias")
			return err
		}

		globalOpts.Repo = rep.Url
	}

	if fs, err := os.Stat(globalOpts.ConfigURL); err != nil || fs.Size() == 0 {
		fmt.Println(fs.Size())
		fmt.Println(err)
		return cfg.Save()
	}

	return nil
}

// func executeCat(snapshotID string, file string) error {
// 	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
// 	if err != nil {
// 		return err
// 	}
// 	_, snapshot, err := repository.FindSnapshot(snapshotID)
// 	if err != nil {
// 		return err
// 	}

// 	if archive, ok := snapshot.Archives[file]; ok {
// 		b, _, err := knoxite.DecodeArchiveData(repository, *archive)
// 		if err != nil {
// 			return err
// 		}

// 		_, err = os.Stdout.Write(b)
// 		return err
// 	}

// 	return fmt.Errorf("%s: No such file or directory", file)
// }

func executeConfigInit() error {
	log.Printf("Writing configuration file to: %s\n", cfg.URL().Path)
	return cfg.Save()
}

func executeConfigAlias(alias string) error {
	// At first check if the configuration file already exists
	cfg.Repositories[alias] = config.RepoConfig{
		Url:         globalOpts.Repo,
		Compression: utils.CompressionText(knoxite.CompressionNone),
		// Tolerance:   0,
		Encryption: utils.EncryptionText(knoxite.EncryptionAES),
	}

	return cfg.Save()
}

func executeConfigSet(option string, values []string) error {
	// This probably wont scale for more complex configuration options but works
	// fine for now.
	parts := strings.Split(option, ".")
	if len(parts) != 2 {
		return fmt.Errorf("config set needs to work on an alias and a option like this: alias.option")
	}

	// The first part should be the repos alias
	repo, ok := cfg.Repositories[strings.ToLower(parts[0])]
	if !ok {
		return fmt.Errorf("no alias with name %s found", parts[0])
	}

	opt := strings.ToLower(parts[1])
	switch opt {
	case "url":
		repo.Url = values[0]
	case "compression":
		repo.Compression = values[0]
	case "encryption":
		repo.Encryption = values[0]
	case "tolerance":
		tol, err := strconv.Atoi(values[0])
		if err != nil {
			return fmt.Errorf("failed to convert %s to uint for the fault tolerance option: %v", opt, err)
		}
		repo.Tolerance = uint(tol)
	case "store_excludes":
		repo.StoreExcludes = values
	case "restore_excludes":
		repo.RestoreExcludes = values
	case "pedantic":
		b, err := strconv.ParseBool(values[0])
		if err != nil {
			return err
		}
		repo.Pedantic = b

	default:
		return fmt.Errorf("unknown configuration option: %s", opt)
	}
	cfg.Repositories[strings.ToLower(parts[0])] = repo

	return cfg.Save()
}

func executeConfigInfo() error {
	tab := gotable.NewTable(
		[]string{"Alias", "Storage URL", "Compression", "Tolerance", "Encryption"},
		[]int64{-15, -35, -15, -15, 15},
		"No repository configurations found.")

	for alias, repo := range cfg.Repositories {
		tab.AppendRow([]interface{}{
			alias,
			repo.Url,
			repo.Compression,
			fmt.Sprintf("%v", repo.Tolerance),
			repo.Encryption,
		})
	}
	return tab.Print()
}

func executeConfigCat() error {
	buf := new(bytes.Buffer)
	if err := toml.NewEncoder(buf).Encode(*cfg); err != nil {
		return err
	}

	fmt.Printf("%s\n", buf)
	return nil
}

func executeConfigConvert(source string, target string) error {
	// Load the source config
	scr, err := config.New(source)
	if err != nil {
		return err
	}
	if err = scr.Load(); err != nil {
		return err
	}

	// Create the target
	tar, err := config.New(target)
	if err != nil {
		return err
	}

	// copy over the repo configs and save the target
	tar.Repositories = scr.Repositories
	return tar.Save()
}

func executeRepoInit() error {
	// acquire a shutdown lock. we don't want these next calls to be interrupted
	lock := shutdown.Lock()
	if lock == nil {
		return nil
	}
	defer lock()

	_, err := newRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return fmt.Errorf("creating repository at %s failed: %v", globalOpts.Repo, err)
	}

	// l.Printf("Created new repository at %s\n", (*r.BackendManager().Backends[0]).Location())
	return nil
}

func executeRepoChangePassword(password string) error {
	r, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}

	err = r.ChangePassword(password)
	if err != nil {
		return err
	}

	l.Printf("Changed password successfully\n")
	return nil
}

func executeRepoAdd(url string) error {
	// acquire a shutdown lock. we don't want these next calls to be interrupted
	lock := shutdown.Lock()
	if lock == nil {
		return nil
	}
	defer lock()

	r, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}

	backend, err := knoxite.BackendFromURL(url)
	if err != nil {
		return err
	}

	err = backend.InitRepository()
	if err != nil {
		return err
	}

	r.BackendManager().AddBackend(&backend)

	err = r.Save()
	if err != nil {
		return err
	}
	l.Printf("Added %s to repository\n", backend.Location())
	return nil
}

func executeRepoCat() error {
	r, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}

	json, err := json.MarshalIndent(r, "", "    ")
	if err != nil {
		return err
	}
	fmt.Printf("%s\n", json)
	return nil
}

// func executeRepoPack() error {
// 	r, err := openRepository(globalOpts.Repo, globalOpts.Password)
// 	if err != nil {
// 		return err
// 	}
// 	index, err := knoxite.OpenChunkIndex(&r)
// 	if err != nil {
// 		return err
// 	}

// 	freedSize, err := index.Pack(&r)
// 	if err != nil {
// 		return err
// 	}

// 	err = index.Save(&r)
// 	if err != nil {
// 		return err
// 	}

// 	l.Printf("Freed storage space: %s\n", knoxite.SizeToString(freedSize))
// 	return nil
// }

func executeRepoInfo() error {
	r, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}

	tab := gotable.NewTable([]string{"Storage URL", "Available Space"},
		[]int64{-48, 15},
		"No backends found.")

	for _, be := range r.BackendManager().Backends {
		space, _ := (*be).AvailableSpace()
		tab.AppendRow([]interface{}{
			(*be).Location(),
			knoxite.SizeToString(space)})
	}

	_ = tab.Print()
	return nil
}

func openRepository(path, password string) (knoxite.Repository, error) {
	if password == "" {
		var err error
		password, err = utils.ReadPassword("Enter password:")
		if err != nil {
			return knoxite.Repository{}, err
		}
	}

	return knoxite.OpenRepository(path, password)
}

func newRepository(path, password string) (knoxite.Repository, error) {
	if password == "" {
		var err error
		password, err = utils.ReadPasswordTwice("Enter a password to encrypt this repository with:", "Confirm password:")
		if err != nil {
			return knoxite.Repository{}, err
		}
	}

	return knoxite.NewRepository(path, password)
}

func executeRestore(snapshotID, target string, opts RestoreOptions) error {
	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}

	_, snapshot, err := repository.FindSnapshot(snapshotID)
	if err != nil {
		return err
	}

	progress, err := knoxite.DecodeSnapshot(repository, snapshot, target, opts.Excludes, opts.Pedantic)
	if err != nil {
		return err
	}

	// pb := &goprogressbar.ProgressBar{Total: 1000, Width: 40}
	stats := knoxite.Stats{}
	lastPath := ""

	errs := make(map[string]error)
	for p := range progress {
		if p.Error != nil {
			if opts.Pedantic {
				fmt.Println()
				return p.Error
			}
			errs[p.Path] = p.Error
			stats.Errors++
		}

		// pb.Total = int64(p.CurrentItemStats.Size)
		// pb.Current = int64(p.CurrentItemStats.Transferred)
		// pb.PrependText = fmt.Sprintf("%s / %s  %s/s",
		// 	knoxite.SizeToString(uint64(pb.Current)),
		// 	knoxite.SizeToString(uint64(pb.Total)),
		// 	knoxite.SizeToString(p.TransferSpeed()))

		if p.Path != lastPath {
			// We have just started restoring a new item
			if len(lastPath) > 0 {
				fmt.Println()
			}
			lastPath = p.Path
			// pb.Text = p.Path
		}
		if p.CurrentItemStats.Size == p.CurrentItemStats.Transferred {
			// We have just finished restoring an item
			stats.Add(p.TotalStatistics)
		}

		// pb.LazyPrint()
	}
	fmt.Println()
	fmt.Println("Restore done:", stats.String())
	for file, err := range errs {
		fmt.Printf("'%s' failed to restore: %v\n", file, err)
	}

	return nil
}

func executeSnapshotRemove(snapshotID string) error {
	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}
	chunkIndex, err := knoxite.OpenChunkIndex(&repository)
	if err != nil {
		return err
	}

	volume, snapshot, err := repository.FindSnapshot(snapshotID)
	if err != nil {
		return err
	}

	err = volume.RemoveSnapshot(snapshot.ID)
	if err != nil {
		return err
	}

	chunkIndex.RemoveSnapshot(snapshot.ID)
	err = chunkIndex.Save(&repository)
	if err != nil {
		return err
	}

	err = repository.Save()
	if err != nil {
		return err
	}

	fmt.Printf("Snapshot %s removed: %s\n", snapshot.ID, snapshot.Stats.String())
	fmt.Println("Do not forget to run 'repo pack' to delete un-referenced chunks and free up storage space!")
	return nil
}

func executeSnapshotList(volID string) error {
	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}

	volume, err := repository.FindVolume(volID)
	if err != nil {
		return err
	}

	tab := gotable.NewTable([]string{"ID", "Date", "Original Size", "Storage Size", "Description"},
		[]int64{-8, -19, 13, 12, -48}, "No snapshots found. This volume is empty.")
	totalSize := uint64(0)
	totalStorageSize := uint64(0)

	for _, snapshotID := range volume.Snapshots {
		snapshot, err := volume.LoadSnapshot(snapshotID, &repository)
		if err != nil {
			return err
		}
		tab.AppendRow([]interface{}{
			snapshot.ID,
			snapshot.Date.Format(timeFormat),
			knoxite.SizeToString(snapshot.Stats.Size),
			knoxite.SizeToString(snapshot.Stats.StorageSize),
			snapshot.Description})
		totalSize += snapshot.Stats.Size
		totalStorageSize += snapshot.Stats.StorageSize
	}

	tab.SetSummary([]interface{}{"", "", knoxite.SizeToString(totalSize), knoxite.SizeToString(totalStorageSize), ""})
	_ = tab.Print()
	return nil
}

func store(repository *knoxite.Repository, chunkIndex *knoxite.ChunkIndex, snapshot *knoxite.Snapshot, targets []string, opts StoreOptions) error {
	// we want to be notified during the first phase of a shutdown
	cancel = shutdown.First()
	// running = true

	wd, err := os.Getwd()
	if err != nil {
		return err
	}

	if len(repository.BackendManager().Backends)-int(opts.FailureTolerance) <= 0 {
		return ErrRedundancyAmount
	}
	compression, err := utils.CompressionTypeFromString(opts.Compression)
	if err != nil {
		return err
	}
	encryption, err := utils.EncryptionTypeFromString(opts.Encryption)
	if err != nil {
		return err
	}

	so := knoxite.StoreOptions{
		CWD:         wd,
		Paths:       targets,
		Excludes:    opts.Excludes,
		Compress:    compression,
		Encrypt:     encryption,
		Pedantic:    opts.Pedantic,
		DataParts:   uint(len(repository.BackendManager().Backends) - int(opts.FailureTolerance)),
		ParityParts: opts.FailureTolerance,
	}

	// f, err := os.OpenFile(filepath.Join(wd, "progress.log"), os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0600)
	// if err != nil {
	// 	return err
	// }
	// defer f.Close()
	// goprogressbar.Stdout = f

	// startTime := time.Now()
	progressHook = snapshot.Add(*repository, chunkIndex, so)

	lastPath := ""

	items = uint64(1)
	// items <- int64(1)
	errs := make(map[string]error)
	for p := range progressHook {
		select {
		case n := <-cancel:
			fmt.Println("Aborting...")
			close(n)
			return nil

		default:
			if p.Error != nil {
				if opts.Pedantic {
					fmt.Println()
					return p.Error
				}
				errs[p.Path] = p.Error
				snapshot.Stats.Errors++
			}
			if p.Path != lastPath && lastPath != "" {
				// items <- (int64(1) + <-items)
				items++
				// fmt.Println()
			}
			// f.WriteString(fmt.Sprintf("%s  %s/s\n",
			// 	knoxite.SizeToString(uint64(int64(p.CurrentItemStats.Transferred))),
			// 	knoxite.SizeToString(p.TransferSpeed())))

			// f.WriteString(fmt.Sprintf("%s / %s (%s of %s)\n",
			// 	knoxite.SizeToString(uint64(int64(p.TotalStatistics.Transferred))),
			// 	knoxite.SizeToString(uint64(int64(p.TotalStatistics.Size))),
			// 	humanize.Comma(items),
			// 	humanize.Comma(int64(p.TotalStatistics.Files+p.TotalStatistics.Dirs+p.TotalStatistics.SymLinks))))

			if p.Path != lastPath {
				lastPath = p.Path
				fmt.Println(p.Path)
			}
			// fmt.Println(p.Path)
		}
	}

	// p2 := <-progress

	// f.WriteString(fmt.Sprintf("%s/s\n",
	// 	knoxite.SizeToString(uint64(float64(int64(p2.TotalStatistics.Transferred))/time.Since(startTime).Seconds()))))
	// f.WriteString(fmt.Sprintf("\nSnapshot %s created: %s\n", snapshot.ID, snapshot.Stats.String()))
	// for file, err := range errs {
	// 	f.WriteString(fmt.Sprintf("'%s': failed to store: %v\n", file, err))
	// }

	return nil
}

func executeStore(volumeID string, args []string, opts StoreOptions) error {
	targets := []string{}
	for _, target := range args {
		if absTarget, err := filepath.Abs(target); err == nil {
			target = absTarget
		}
		targets = append(targets, target)
	}

	// acquire a shutdown lock. we don't want these next calls to be interrupted
	lock := shutdown.Lock()
	if lock == nil {
		return nil
	}
	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}
	volume, err := repository.FindVolume(volumeID)
	if err != nil {
		return err
	}
	snapshot, err := knoxite.NewSnapshot(opts.Description)
	if err != nil {
		return err
	}
	chunkIndex, err := knoxite.OpenChunkIndex(&repository)
	if err != nil {
		return err
	}
	// release the shutdown lock
	lock()

	err = store(&repository, &chunkIndex, snapshot, targets, opts)
	if err != nil {
		return err
	}

	// acquire another shutdown lock. we don't want these next calls to be interrupted
	lock = shutdown.Lock()
	if lock == nil {
		return nil
	}
	defer lock()

	err = snapshot.Save(&repository)
	if err != nil {
		return err
	}
	err = volume.AddSnapshot(snapshot.ID)
	if err != nil {
		return err
	}
	err = chunkIndex.Save(&repository)
	if err != nil {
		return err
	}
	return repository.Save()
}

// func executeVerifyRepo(opts VerifyOptions) error {
// 	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
// 	if err != nil {
// 		return err
// 	}

// 	progress, err := knoxite.VerifyRepo(repository, opts.Percentage)
// 	if err != nil {
// 		return err
// 	}

// 	errors := verify(progress)

// 	fmt.Println()
// 	fmt.Printf("Verify repository done: %d errors\n", len(errors))
// 	return nil
// }

// func executeVerifyVolume(volumeId string, opts VerifyOptions) error {
// 	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
// 	if err != nil {
// 		return err
// 	}

// 	progress, err := knoxite.VerifyVolume(repository, volumeId, opts.Percentage)
// 	if err != nil {
// 		return err
// 	}

// 	errors := verify(progress)

// 	fmt.Println()
// 	fmt.Printf("Verify volume done: %d errors\n", len(errors))
// 	return nil
// }

// func executeVerifySnapshot(snapshotId string, opts VerifyOptions) error {
// 	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
// 	if err != nil {
// 		return err
// 	}

// 	progress, err := knoxite.VerifySnapshot(repository, snapshotId, opts.Percentage)
// 	if err != nil {
// 		return err
// 	}

// 	errors := verify(progress)

// 	fmt.Println()
// 	fmt.Printf("Verify snapshot done: %d errors\n", len(errors))
// 	return nil
// }

func verify(progress <-chan knoxite.Progress) []error {
	var errors []error

	// pb := &goprogressbar.ProgressBar{Total: 1000, Width: 40}
	lastPath := ""

	for p := range progress {
		if p.Error != nil {
			fmt.Println()
			errors = append(errors, p.Error)
		}

		// pb.Total = int64(p.CurrentItemStats.Size)
		// pb.Current = int64(p.CurrentItemStats.Transferred)
		// pb.PrependText = fmt.Sprintf("%s / %s",
		// 	knoxite.SizeToString(uint64(pb.Current)),
		// 	knoxite.SizeToString(uint64(pb.Total)))

		if p.Path != lastPath {
			// We have just started restoring a new item
			if len(lastPath) > 0 {
				fmt.Println()
			}
			lastPath = p.Path
			// pb.Text = p.Path
		}

		// pb.LazyPrint()
	}

	return errors
}

func executeVolumeInit(name, description string) (string, error) {
	// acquire a shutdown lock. we don't want these next calls to be interrupted
	lock := shutdown.Lock()
	if lock == nil {
		return "", nil
	}
	defer lock()

	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return "", err
	}

	vol, err := knoxite.NewVolume(name, description)
	if err != nil {
		return "", err
	}

	err = repository.AddVolume(vol)
	if err != nil {
		return "", fmt.Errorf("creating volume %s failed: %v", name, err)
	}

	err = repository.Save()
	if err != nil {
		return "", err
	}
	return vol.ID, nil
}

func executeVolumeRemove(volumeID string) error {
	repo, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}

	chunkIndex, err := knoxite.OpenChunkIndex(&repo)
	if err != nil {
		return err
	}

	vol, err := repo.FindVolume(volumeID)
	fmt.Println(err)
	if err != nil {
		return err
	}

	for _, s := range vol.Snapshots {
		if err := vol.RemoveSnapshot(s); err != nil {
			return err
		}

		chunkIndex.RemoveSnapshot(s)
	}

	if err := repo.RemoveVolume(vol); err != nil {
		fmt.Println(err)
		return err
	}

	if err := chunkIndex.Save(&repo); err != nil {
		fmt.Println(err)
		return err
	}

	if err := repo.Save(); err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}

func executeVolumeList() error {
	repository, err := openRepository(globalOpts.Repo, globalOpts.Password)
	if err != nil {
		return err
	}

	tab := gotable.NewTable([]string{"ID", "Name", "Description"},
		[]int64{-8, -32, -48}, "No volumes found. This repository is empty.")
	for _, volume := range repository.Volumes {
		tab.AppendRow([]interface{}{volume.ID, volume.Name, volume.Description})
	}

	_ = tab.Print()
	return nil
}
