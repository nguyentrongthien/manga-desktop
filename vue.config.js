module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        "productName": "Manga Desktop",
        "win": {
          "target": ["zip"]
        },
        "portable": {
          "artifactName": "manga_desktop.exe"
        },
      }
    }
  }
}
