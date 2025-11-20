nr.defineComponent({
    name: 'app',
    template: `
        <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    `,
    beforeCreate: () => {return { useShadowRoot: false }},
    afterCreate: () => {
        r = document.querySelector('#app > div')
        document.addEventListener('engine:reload', async () => {
            window.newtab.query = document.querySelector('#search_bar input')?.value || ''
            r.innerHTML = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`
            await fetch('/engines/index.json')
                .then(r => {
                    if (!r.ok) {
                        console.error(`Fetch Error: ${r.statusText} (${r.status})`)
                        return false
                    }
                    return r.json()
                })
                .then(d => {
                    window.newtab.engines = d
                    window.newtab.engine = d[localStorage.getItem('engine')]
                })
                .catch(e => console.error(e))
            r.innerHTML = `
                <img id="engine_logo" src="${window.newtab.engine.logo_url}">
                <select id="engine_selector">
                    ${Object.keys(window.newtab.engines).map(e => `
                        <option value="${e}" ${e == localStorage.getItem('engine') ? 'selected' : ''}>${window.newtab.engines[e].pretty_name}</option>
                    `).join('')}
                </select>
                <div id="search_bar">
                    <input type="text" placeholder="Search..." value="${window.newtab.query}">
                    <button></button>
                </div>
            `
            document.getElementById('engine_selector').addEventListener('click', () => document.dispatchEvent(new CustomEvent('engine:select')))
            document.querySelector('#search_bar button').addEventListener('click', () => document.dispatchEvent(new CustomEvent('newtab:search')))
            document.querySelector('#search_bar input').focus()
            document.querySelector('#search_bar input').addEventListener('keydown', (e) => { e.key == 'Enter' ? document.querySelector('#search_bar button').click() : null})
        })
        document.addEventListener('engine:select', () => {
            localStorage.setItem('engine',document.getElementById('engine_selector').value)
            document.dispatchEvent(new CustomEvent('engine:reload'))
        })
        document.dispatchEvent(new CustomEvent('engine:reload'))
    }
})

nr.defineComponent({
    name: 'footer',
    template: `
    <div class="hr w-100"></div>
    <div></div>
    `,
    beforeCreate: () => {return { useShadowRoot: false }},
    afterCreate: () => {
        const r = document.querySelector('#footer > div > div:nth-child(2)')
        window.newtab.authors.forEach(author => {
            const a = document.createElement('a')

            a.href = author.href ? author.href : '/nohref.html'
            a.textContent = `${author.name} ${author.user ? `(${author.user})` : ''}`
            r.appendChild(a)
        })
    }
})

document.addEventListener('newtab:search', () => {
    const query = encodeURIComponent(document.querySelector('#search_bar input').value)
    const href = `${window.newtab.engine.search_template.replace('%s', query)}${localStorage.getItem('allow-utm') == 'true' ? '&utm_source=true1ann&utm_medium=newtab' : ''}`
    window.location.href = href
})