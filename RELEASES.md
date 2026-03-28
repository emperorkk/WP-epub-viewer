# Releases

Download the latest installable ZIP from the [Releases page](https://github.com/emperorkk/WP-epub-viewer/releases).

## Manual Installation

1. Download `wp-kko-epub-viewer-v1.0.0.zip` from the release
2. Go to **WordPress Admin > Plugins > Add New > Upload Plugin**
3. Select the ZIP file and click **Install Now**
4. Activate the plugin

## Creating a Release ZIP Manually

From the repo root:

```bash
mkdir wp-kko-epub-viewer
cp -r wp-kko-epub-viewer.php includes elementor blocks assets languages LICENSE README.md DOCUMENTATION.md wp-kko-epub-viewer/
zip -r wp-kko-epub-viewer-v1.0.0.zip wp-kko-epub-viewer/
rm -rf wp-kko-epub-viewer
```
