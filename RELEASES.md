# Releases

Download the latest installable ZIP from the [Releases page](https://github.com/emperorkk/WP-epub-viewer/releases).

## Manual Installation

1. Download `superior-e-pub-viewer-v2.0.0.zip` from the release
2. Go to **WordPress Admin > Plugins > Add New > Upload Plugin**
3. Select the ZIP file and click **Install Now**
4. Activate the plugin

## Creating a Release ZIP Manually

From the repo root:

```bash
mkdir superior-e-pub-viewer
cp -r superior-e-pub-viewer.php includes elementor blocks assets languages LICENSE README.md DOCUMENTATION.md superior-e-pub-viewer/
zip -r superior-e-pub-viewer-v2.0.0.zip superior-e-pub-viewer/
rm -rf superior-e-pub-viewer
```
