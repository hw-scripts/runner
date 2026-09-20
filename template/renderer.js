function renderOptions(template, vars) {
    return template.replace(
        /<options\s+var="([^"]+)"\s+value="([^"]*)">([\s\S]*?)<\/options>/g,
        (_, varName, valueTemplate, textTemplate) => {
            const items = vars[varName] ?? [];

            return items.map(item => {
                const expand = str => str.replace(
                    /\{\.([\w]+)\}/g,
                    (_, field) => item[field] ?? ''
                );

                return `<option value="${expand(valueTemplate)}">${expand(textTemplate)}</option>`;
            }).join('');
        }
    );
}

function renderVars(template, vars) {
    return template.replace(
        /\{\{\s*([\w.]+)\s*\}\}/g,
        (_, path) => path.split('.').reduce(
            (obj, key) => obj?.[key],
            vars
        ) ?? ''
    );
}

function render(template, vars) {
    template = renderOptions(template, vars);
    template = renderVars(template, vars);

    return template;
}
