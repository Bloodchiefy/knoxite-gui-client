package main

import (
	"embed"
	"os"
	"runtime"

	"github.com/pkg/browser"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

//go:embed all:frontend/dist
var assets embed.FS
var app *App

func main() {
	// Create an instance of the app structure
	app := NewApp()

	AppMenu := menu.NewMenu()

	FileMenu := AppMenu.AddSubmenu("File")
	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		os.Exit(0)
	})

	HelpMenu := AppMenu.AddSubmenu("?")
	HelpMenu.AddText("Help", nil, openHelp)

	if runtime.GOOS == "darwin" {
		AppMenu.Append(menu.EditMenu())
	}

	fs, err := os.ReadFile("frontend/src/assets/images/icon.png")
	if err != nil {
		panic("couldn't load icon")
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "knoxite-gui-client",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 118, G: 126, B: 150, A: 1},
		OnStartup:        app.startup,
		Menu:             AppMenu,
		Bind: []interface{}{
			app,
		},
		Linux: &linux.Options{
			Icon: fs,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

func openHelp(_ *menu.CallbackData) {
	browser.OpenURL("https://github.com/Bloodchiefy/knoxite-gui-client")
}

func reload(_ *menu.CallbackData) {
	app.ctx.Done()
}
