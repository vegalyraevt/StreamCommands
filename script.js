fetch('commands.json')
    .then(response => response.json())
    .then(data => {
        // Store data globally for search functionality
        window.commandsData = data;
        // Apply fonts from JSON
        if (data.fonts) {
            document.querySelector('.header h1').style.fontFamily = data.fonts.title + ', monospace';
            document.querySelector('.footer').style.fontFamily = data.fonts.footer + ', monospace';
            document.body.style.fontFamily = data.fonts.description + ', monospace';
            document.querySelector('.blurb').style.fontFamily = data.fonts.description + ', monospace';
        }

        const container = document.getElementById('commands-container');
        data.sections.forEach(section => {
            let sectionDiv;
            if (section.dropdown) {
                sectionDiv = document.createElement('details');
                sectionDiv.className = 'dropdown';
                const summary = document.createElement('summary');
                summary.textContent = section.name;
                summary.style.color = section.color;
                sectionDiv.appendChild(summary);
            } else {
                sectionDiv = document.createElement('div');
                sectionDiv.className = 'section';
                const h2 = document.createElement('h2');
                h2.textContent = section.name;
                h2.style.color = section.color;
                sectionDiv.appendChild(h2);
            }

            if (section.logo) {
                const img = document.createElement('img');
                img.src = section.logo;
                img.alt = section.name + ' Logo';
                sectionDiv.appendChild(img);
            }
            if (section.pfp) {
                const img = document.createElement('img');
                img.src = section.pfp;
                img.alt = section.name + ' PFP';
                sectionDiv.appendChild(img);
            }

            const ul = document.createElement('ul');
            section.commands.forEach(cmd => {
                const li = document.createElement('li');
                li.className = 'command';
                li.style.color = section.color;

                const mainSpan = document.createElement('span');
                mainSpan.className = 'main';
                mainSpan.textContent = cmd.main || cmd.name;
                if (data.fonts) mainSpan.style.fontFamily = data.fonts.commandMain + ', monospace';
                li.appendChild(mainSpan);

                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'badge ' + (cmd.userType || 'all');
                badgeSpan.textContent = cmd.userType || 'all';
                li.appendChild(badgeSpan);

                const cooldownsSpan = document.createElement('span');
                cooldownsSpan.className = 'cooldowns';
                cooldownsSpan.textContent = `Global: ${cmd.globalCooldown || 0}s, User: ${cmd.userCooldown || 0}s`;
                li.appendChild(cooldownsSpan);

                if ((cmd.triggers || []).length > 1) {
                    const details = document.createElement('details');
                    details.className = 'alternates';
                    const summary = document.createElement('summary');
                    summary.textContent = 'Triggers';
                    details.appendChild(summary);
                    const altUl = document.createElement('ul');
                    (cmd.triggers || [cmd.main || cmd.name]).forEach(trigger => {
                        const altLi = document.createElement('li');
                        altLi.textContent = trigger;
                        altUl.appendChild(altLi);
                    });
                    details.appendChild(altUl);
                    li.appendChild(details);
                }

                const descP = document.createElement('p');
                descP.textContent = cmd.description || 'No description';
                if (data.fonts) descP.style.fontFamily = data.fonts.description + ', monospace';
                li.appendChild(descP);

                ul.appendChild(li);
            });
            sectionDiv.appendChild(ul);
            container.appendChild(sectionDiv);
        });
    })
    .catch(error => console.error('Error loading commands:', error));

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('command-search');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();

        if (query.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        const results = performSearch(query);
        displaySearchResults(results, query);
    });

    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function performSearch(query) {
    const results = {
        commands: [],
        triggers: [],
        descriptions: []
    };

    window.commandsData.sections.forEach(section => {
        section.commands.forEach(cmd => {
            const commandName = (cmd.main || cmd.name).toLowerCase();
            const description = (cmd.description || '').toLowerCase();
            const triggers = (cmd.triggers || []).map(t => t.toLowerCase());

            // Check command name
            if (commandName.includes(query)) {
                results.commands.push({
                    command: cmd.main || cmd.name,
                    section: section.name,
                    sectionColor: section.color,
                    description: cmd.description,
                    type: 'command'
                });
            }

            // Check triggers
            triggers.forEach(trigger => {
                if (trigger.includes(query) && !results.commands.some(r => r.command === (cmd.main || cmd.name))) {
                    results.triggers.push({
                        command: cmd.main || cmd.name,
                        trigger: trigger,
                        section: section.name,
                        sectionColor: section.color,
                        description: cmd.description,
                        type: 'trigger'
                    });
                }
            });

            // Check description
            if (description.includes(query) &&
                !results.commands.some(r => r.command === (cmd.main || cmd.name)) &&
                !results.triggers.some(r => r.command === (cmd.main || cmd.name))) {
                results.descriptions.push({
                    command: cmd.main || cmd.name,
                    section: section.name,
                    sectionColor: section.color,
                    description: cmd.description,
                    type: 'description'
                });
            }
        });
    });

    return results;
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    const allResults = [...results.commands, ...results.triggers, ...results.descriptions];

    if (allResults.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'search-no-results';
        noResults.textContent = 'No commands found matching "' + query + '"';
        searchResults.appendChild(noResults);
    } else {
        allResults.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';

            const commandSpan = document.createElement('div');
            commandSpan.className = 'search-result-command';
            commandSpan.textContent = result.command;
            resultItem.appendChild(commandSpan);

            if (result.type === 'trigger') {
                const triggerSpan = document.createElement('div');
                triggerSpan.className = 'search-result-trigger';
                triggerSpan.textContent = 'Trigger: ' + result.trigger;
                resultItem.appendChild(triggerSpan);
            }

            const descSpan = document.createElement('div');
            descSpan.className = 'search-result-description';
            descSpan.textContent = result.description || 'No description';
            resultItem.appendChild(descSpan);

            const sectionSpan = document.createElement('div');
            sectionSpan.className = 'search-result-section';
            sectionSpan.textContent = result.section;
            sectionSpan.style.color = result.sectionColor;
            resultItem.appendChild(sectionSpan);

            resultItem.addEventListener('click', function() {
                // Scroll to the command in the main list
                const commandElements = document.querySelectorAll('.command .main');
                for (let elem of commandElements) {
                    if (elem.textContent.toLowerCase() === result.command.toLowerCase()) {
                        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add a temporary highlight
                        elem.style.background = 'rgba(0, 255, 0, 0.2)';
                        setTimeout(() => {
                            elem.style.background = '';
                        }, 2000);
                        break;
                    }
                }
                searchResults.style.display = 'none';
                document.getElementById('command-search').value = '';
            });

            searchResults.appendChild(resultItem);
        });
    }

    searchResults.style.display = allResults.length > 0 ? 'block' : 'none';
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for commands to load before initializing search
    setTimeout(initializeSearch, 100);
});
