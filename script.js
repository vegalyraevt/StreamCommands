fetch('commands.json')
    .then(response => response.json())
    .then(data => {
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
                    summary.textContent = 'Alternates';
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
