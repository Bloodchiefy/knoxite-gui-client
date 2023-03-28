package main

import (
	"embed"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

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
