// Create option element
createOptionElement(option, index) {
    const div = document.createElement('div');
    div.className = 'refyne-option';

    // Header
    const header = document.createElement('div');
    header.className = 'refyne-option-header';

    const icon = document.createElement('span');
    icon.className = 'refyne-option-icon';
    icon.textContent = option.icon;

    const badge = document.createElement('span');
    badge.className = `refyne-option-badge ${option.type}`;
    badge.textContent = option.label;

    header.appendChild(icon);
    header.appendChild(badge);

    // Text
    const text = document.createElement('p');
    text.className = 'refyne-option-text';
    text.textContent = option.text;

    // Footer
    const footer = document.createElement('div');
    footer.className = 'refyne-option-footer';

    const useBtn = document.createElement('button');
    useBtn.className = 'refyne-use-button';
    useBtn.textContent = 'Use This';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'refyne-copy-button';
    copyBtn.textContent = 'Copy';

    footer.appendChild(useBtn);
    footer.appendChild(copyBtn);

    div.appendChild(header);
    div.appendChild(text);
    div.appendChild(footer);

    return div;
}
