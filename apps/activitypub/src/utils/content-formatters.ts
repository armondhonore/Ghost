import DOMPurify from 'dompurify';

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:'];
const TWITTER_WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';
const TWITTER_EMBED_MIN_HEIGHT = 120;
const TWITTER_EMBED_INITIAL_HEIGHT = 240;
const TWITTER_EMBED_MAX_HEIGHT = 1200;

interface TwitterEmbedSandboxOptions {
    fontSize?: string;
    fontStyle?: 'sans' | 'serif';
    darkMode?: boolean;
    sepia?: boolean;
}

export function isSafeUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return SAFE_URL_PROTOCOLS.includes(parsed.protocol);
    } catch {
        return false;
    }
}

export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html);
}

export function stripHtml(html: string, exclude: string[] = []): string {
    // If no exclusions, use the original logic
    if (exclude.length === 0) {
        // Replace <br> tags with spaces
        const withLineBreaks = html.replace(/<br\s*\/?>/gi, ' ');

        // Replace tags that should have a space after them
        const withSpaces = withLineBreaks.replace(/<\/p>\s*<p>|<\/div>\s*<div>|<\/h[1-6]>\s*<|<\/li>\s*<li>|<\/a>/gi, ' ');

        // Remove all HTML tags
        return withSpaces.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    // Convert exclusions to lowercase for case-insensitive matching
    const excludeTags = exclude.map(tag => tag.toLowerCase());

    // Create a temporary placeholder for excluded tags
    const placeholders: {[key: string]: string} = {};
    let placeholderCount = 0;

    // Convert block-level closing tags to <br> before extracting excluded tags
    // This handles headings, paragraphs, divs, list items, etc.
    const withBlockBreaks = html.replace(/<\/(h[1-6]|p|div|li|blockquote|pre)>/gi, '<br>');

    // Process each excluded tag type (including the <br> tags we just added)
    let processedWithExclusions = withBlockBreaks;
    for (const tag of excludeTags) {
        // Match both opening and closing tags, and self-closing tags
        const regex = new RegExp(`<${tag}[^>]*>.*?<\\/${tag}>|<${tag}[^>]*\\/?>`, 'gis');

        processedWithExclusions = processedWithExclusions.replace(regex, (match) => {
            const placeholder = `__EXCLUDED_TAG_${placeholderCount += 1}__`;
            placeholders[placeholder] = match;
            return placeholder;
        });
    }

    // Replace <br> tags with spaces (only if 'br' is not in exclusions)
    let withLineBreaks = processedWithExclusions;
    if (!excludeTags.includes('br')) {
        withLineBreaks = processedWithExclusions.replace(/<br\s*\/?>/gi, ' ');
    }

    // Remove all remaining HTML tags
    let result = withLineBreaks.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    // Restore the excluded tags
    for (const [placeholder, originalTag] of Object.entries(placeholders)) {
        result = result.replace(placeholder, originalTag);
    }

    return result;
}

export const formatArticle = (content: string, postUrl?: string) => {
    // Create a temporary div to parse the HTML
    const div = document.createElement('div');
    div.innerHTML = content;

    if (postUrl) {
        // Find all audio and video card divs
        const mediaCards = div.querySelectorAll('.kg-audio-card, .kg-video-card');

        // Wrap each media card in an anchor tag
        for (let i = 0; i < mediaCards.length; i++) {
            const mediaCard = mediaCards[i] as HTMLElement;
            const wrapper = document.createElement('a');
            wrapper.href = postUrl;
            wrapper.target = '_blank';
            wrapper.rel = 'noopener noreferrer';
            wrapper.style.cursor = 'pointer';
            wrapper.style.display = 'block';
            wrapper.style.textDecoration = 'none';
            wrapper.style.color = 'inherit';

            // Move the media card into the wrapper
            mediaCard.parentNode?.insertBefore(wrapper, mediaCard);
            wrapper.appendChild(mediaCard);
        }
    }

    // Find all anchor tags
    const links = div.getElementsByTagName('a');

    // Add target="_blank" and rel attributes to each link
    for (let i = 0; i < links.length; i++) {
        links[i].setAttribute('target', '_blank');
        links[i].setAttribute('rel', 'noopener noreferrer');
    }

    return div.innerHTML;
};

export const openLinksInNewTab = (content: string) => {
    // Create a temporary div to parse the HTML
    const div = document.createElement('div');
    div.innerHTML = content;

    // Find all anchor tags
    const links = div.getElementsByTagName('a');

    // Add target="_blank" and rel attributes to each link
    for (let i = 0; i < links.length; i++) {
        const href = links[i].getAttribute('href') || '';
        // Block javascript:, data:, and other dangerous protocols
        if (href.match(/^\s*(javascript|data|vbscript):/i)) {
            links[i].removeAttribute('href');
        }
        links[i].setAttribute('target', '_blank');
        links[i].setAttribute('rel', 'noopener noreferrer');
    }

    return div.innerHTML;
};

const buildTwitterEmbedSrcDoc = (blockquoteHtml: string, options: TwitterEmbedSandboxOptions = {}) => {
    const fontSize = options.fontSize || '1.7rem';
    const fontSizeMultiplier = options.fontStyle === 'serif' ? '1.1' : '1';
    const textColor = options.darkMode ? '#fff' : '#15171a';
    const secondaryTextColor = options.darkMode ? 'rgb(255 255 255 / 0.64)' : 'rgb(124 139 154)';
    const linkColor = options.sepia ? '#DD6B02' : '#14B8FF';
    const bodyClass = options.fontStyle === 'serif' ? 'has-serif-body' : 'has-sans-body';

    return `<!doctype html>
<html>
<head>
    <base target="_blank">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        :root {
            --color-primary-text: ${textColor};
            --color-secondary-text: ${secondaryTextColor};
            --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            --font-serif-alt: Georgia, Times, serif;
            --font-size: ${fontSize};
            --font-size-multiplier: ${fontSizeMultiplier};
        }

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }

        * {
            margin: 0;
        }

        html {
            font-size: 62.5%;
        }

        html,
        body {
            padding: 0;
            overflow: hidden;
            background: transparent;
        }

        body {
            min-width: 0;
            color: var(--color-primary-text);
            font-family: var(--font-sans);
            font-size: calc(var(--font-size) * var(--font-size-multiplier));
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .has-serif-body blockquote.twitter-tweet {
            font-family: var(--font-serif-alt);
        }

        blockquote.twitter-tweet {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            border: 0 !important;
        }

        iframe.twitter-tweet-rendered,
        .twitter-rendered-card {
            margin: 0 auto !important;
            max-width: 550px;
        }

        blockquote.twitter-tweet a:not([class]),
        .twitter-rendered-card__meta a {
            color: ${linkColor} !important;
            text-decoration: underline !important;
        }

    </style>
</head>
<body class="${bodyClass}">
    ${blockquoteHtml}
    <script>
        (function () {
            const minHeight = ${TWITTER_EMBED_MIN_HEIGHT};
            const maxHeight = ${TWITTER_EMBED_MAX_HEIGHT};

            function getHeight() {
                const elements = Array.from(document.body.children).filter(function (element) {
                    return element.tagName !== 'SCRIPT';
                });
                const contentHeight = elements.reduce(function (maxHeight, element) {
                    return Math.max(maxHeight, element.getBoundingClientRect().bottom);
                }, 0);

                return Math.min(Math.max(
                    Math.ceil(contentHeight),
                    minHeight
                ), maxHeight);
            }

            function sendHeight() {
                window.parent.postMessage({
                    type: 'ghost-twitter-embed-resize',
                    height: getHeight()
                }, '*');
            }

            if (typeof ResizeObserver === 'function') {
                new ResizeObserver(sendHeight).observe(document.body);
            }

            document.addEventListener('DOMContentLoaded', sendHeight);
            window.addEventListener('load', sendHeight);

            let attempts = 0;
            const interval = window.setInterval(function () {
                sendHeight();
                attempts += 1;

                if (attempts > 20) {
                    window.clearInterval(interval);
                }
            }, 250);
        })();
    </script>
    <script async src="${TWITTER_WIDGET_SCRIPT_URL}" charset="utf-8"></script>
</body>
</html>`;
};

export const renderTwitterEmbedsInSandbox = (content: string, options: TwitterEmbedSandboxOptions = {}) => {
    const div = document.createElement('div');
    div.innerHTML = content;

    div.querySelectorAll('script').forEach(script => script.remove());

    const blockquotes = Array.from(div.querySelectorAll('blockquote.twitter-tweet'));

    for (const blockquote of blockquotes) {
        const iframe = document.createElement('iframe');

        iframe.className = 'gh-twitter-embed';
        iframe.title = 'Embedded Twitter post';
        iframe.srcdoc = buildTwitterEmbedSrcDoc((blockquote as HTMLElement).outerHTML, options);
        iframe.setAttribute('data-gh-twitter-embed', '');
        iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
        iframe.style.width = '100%';
        iframe.style.height = `${TWITTER_EMBED_INITIAL_HEIGHT}px`;
        iframe.style.border = '0';
        iframe.style.display = 'block';
        iframe.style.margin = '0';
        iframe.style.overflow = 'hidden';

        blockquote.replaceWith(iframe);
    }

    return div.innerHTML;
};

export const enforceVideoCardInlinePlayback = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;

    const videos = div.querySelectorAll('.kg-video-card video');

    for (let i = 0; i < videos.length; i++) {
        const video = videos[i] as HTMLVideoElement;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('x5-playsinline', '');

        if (video.hasAttribute('autoplay')) {
            video.setAttribute('muted', '');
            video.muted = true;
        }
    }

    return div.innerHTML;
};

export const formatFollowNumber = (n: number) => {
    if (n < 10000) {
        return n.toLocaleString();
    }

    const kValue = n / 1000;
    // Round to 1 decimal place if needed
    const formatted = kValue % 1 === 0 ? kValue : kValue.toFixed(1);
    return `${formatted}K`;
};
