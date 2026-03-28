/**
 * Gutenberg block: EPUB Viewer
 */
(function (blocks, element, blockEditor, components, i18n) {
    var el           = element.createElement;
    var Fragment     = element.Fragment;
    var InspectorControls = blockEditor.InspectorControls;
    var MediaUpload  = blockEditor.MediaUpload;
    var useBlockProps = blockEditor.useBlockProps;
    var PanelBody    = components.PanelBody;
    var TextControl  = components.TextControl;
    var SelectControl = components.SelectControl;
    var Button       = components.Button;
    var Placeholder  = components.Placeholder;
    var __           = i18n.__;

    var skins = wpkkoEpubBlock.skins || {};
    var skinOptions = Object.keys(skins).map(function (key) {
        return { label: skins[key], value: key };
    });

    blocks.registerBlockType('wpkko/epub-viewer', {
        title: __('EPUB Viewer', 'wp-kko-epub-viewer'),
        description: __('Embed an EPUB book reader.', 'wp-kko-epub-viewer'),
        icon: 'book-alt',
        category: 'embed',
        keywords: [__('epub'), __('ebook'), __('reader'), __('book')],

        attributes: {
            src:     { type: 'string', default: '' },
            mediaId: { type: 'number', default: 0 },
            skin:    { type: 'string', default: 'ocean-breeze' },
            width:   { type: 'string', default: '100%' },
            height:  { type: 'string', default: '600px' }
        },

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps ? useBlockProps() : {};

            var onSelectMedia = function (media) {
                setAttributes({ src: media.url, mediaId: media.id });
            };

            var sidebar = el(InspectorControls, {},
                el(PanelBody, { title: __('EPUB Settings', 'wp-kko-epub-viewer') },
                    el(SelectControl, {
                        label: __('Skin', 'wp-kko-epub-viewer'),
                        value: attributes.skin,
                        options: skinOptions,
                        onChange: function (val) { setAttributes({ skin: val }); }
                    }),
                    el(TextControl, {
                        label: __('Width', 'wp-kko-epub-viewer'),
                        value: attributes.width,
                        onChange: function (val) { setAttributes({ width: val }); }
                    }),
                    el(TextControl, {
                        label: __('Height', 'wp-kko-epub-viewer'),
                        value: attributes.height,
                        onChange: function (val) { setAttributes({ height: val }); }
                    }),
                    el(TextControl, {
                        label: __('External URL (optional)', 'wp-kko-epub-viewer'),
                        value: attributes.src,
                        onChange: function (val) { setAttributes({ src: val, mediaId: 0 }); },
                        help: __('Enter a direct URL to an EPUB file, or use the upload button above.', 'wp-kko-epub-viewer')
                    })
                )
            );

            var content;
            if (attributes.src) {
                var filename = attributes.src.split('/').pop();
                content = el('div', { className: 'wpkko-epub-block-preview' },
                    el('div', { className: 'wpkko-epub-block-icon' }, '\uD83D\uDCD6'),
                    el('p', {}, __('EPUB Viewer: ', 'wp-kko-epub-viewer') + filename),
                    el('p', { className: 'wpkko-epub-block-skin' },
                        __('Skin: ', 'wp-kko-epub-viewer') + (skins[attributes.skin] || attributes.skin)
                    ),
                    el(MediaUpload, {
                        onSelect: onSelectMedia,
                        allowedTypes: ['application/epub+zip', 'application/octet-stream'],
                        value: attributes.mediaId,
                        render: function (obj) {
                            return el(Button, {
                                onClick: obj.open,
                                variant: 'secondary',
                                isSmall: true
                            }, __('Replace EPUB', 'wp-kko-epub-viewer'));
                        }
                    })
                );
            } else {
                content = el(Placeholder, {
                    icon: 'book-alt',
                    label: __('EPUB Viewer', 'wp-kko-epub-viewer'),
                    instructions: __('Upload an EPUB file or enter a URL in the block settings.', 'wp-kko-epub-viewer')
                },
                    el(MediaUpload, {
                        onSelect: onSelectMedia,
                        allowedTypes: ['application/epub+zip', 'application/octet-stream'],
                        value: attributes.mediaId,
                        render: function (obj) {
                            return el(Button, {
                                onClick: obj.open,
                                variant: 'primary'
                            }, __('Upload EPUB', 'wp-kko-epub-viewer'));
                        }
                    })
                );
            }

            return el(Fragment, {},
                sidebar,
                el('div', blockProps, content)
            );
        },

        save: function () {
            // Dynamic block — rendered server-side.
            return null;
        }
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n
);
