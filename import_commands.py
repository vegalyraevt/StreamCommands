import json

def import_commands():
    # Load STREAMERBOT_Commands.json
    with open('STREAMERBOT_Commands.json', 'r', encoding='utf-8') as f:
        sb_data = json.load(f)

    # Load existing commands.json
    try:
        with open('commands.json', 'r', encoding='utf-8') as f:
            cmd_data = json.load(f)
    except FileNotFoundError:
        cmd_data = {"sections": []}

    # Update existing commands to new structure
    for section in cmd_data['sections']:
        for cmd in section['commands']:
            if 'name' in cmd and 'main' not in cmd:
                cmd['main'] = cmd['name']
                cmd['triggers'] = [cmd['name']]
                cmd['userType'] = 'all'
                cmd['globalCooldown'] = 0
                cmd['userCooldown'] = 0

    # Get existing command names
    existing_commands = set()
    for section in cmd_data['sections']:
        for cmd in section['commands']:
            existing_commands.add(cmd.get('main', cmd.get('name', '')).strip())

    # Group new commands
    new_sections = {}
    for cmd in sb_data['commands']:
        triggers = [t.strip() for t in cmd['command'].replace('\r', '').split('\n') if t.strip()]
        main_trigger = triggers[0] if triggers else ''
        if main_trigger and main_trigger not in existing_commands:
            group = cmd.get('group', '').strip()
            if group == "Auroa Chan's Chinese New Year Plugins":
                group = 'Holiday'
            elif not cmd.get('enabled', True):
                group = 'Disabled'
            elif not group:
                group = 'General'
            section_name = group + ' Commands'

            if section_name not in new_sections:
                new_sections[section_name] = {
                    'name': section_name,
                    'color': '#00ff00',  # default color
                    'dropdown': section_name in ['Holiday Commands', 'Disabled Commands'],
                    'commands': []
                }
                if section_name == 'Aurora Commands':
                    new_sections[section_name]['logo'] = 'Assets/AuroraLOGO.png'
                    new_sections[section_name]['pfp'] = 'Assets/AuroraPFP.jpg'
                    new_sections[section_name]['color'] = '#ff00ff'

            # Determine user type
            permitted_groups = cmd.get('permittedGroups', [])
            permitted_users = cmd.get('permittedUsers', [])
            if permitted_groups:
                if 'Moderators' in permitted_groups:
                    user_type = 'mod'
                else:
                    user_type = 'group'
            elif permitted_users:
                user_type = 'specific'
            else:
                user_type = 'all'

            new_sections[section_name]['commands'].append({
                'triggers': triggers,
                'main': main_trigger,
                'description': cmd.get('name', ''),
                'userType': user_type,
                'globalCooldown': cmd.get('globalCooldown', 0),
                'userCooldown': cmd.get('userCooldown', 0),
                'enabled': cmd.get('enabled', True)
            })

    # Add new sections to cmd_data
    for section in new_sections.values():
        # Check if section already exists
        existing_section = next((s for s in cmd_data['sections'] if s['name'] == section['name']), None)
        if existing_section:
            # Add new commands to existing section
            existing_triggers = {c.get('main', c.get('name', '')) for c in existing_section['commands']}
            for new_cmd in section['commands']:
                if new_cmd['main'] not in existing_triggers:
                    existing_section['commands'].append(new_cmd)
        else:
            cmd_data['sections'].append(section)

    # Save updated commands.json
    with open('commands.json', 'w', encoding='utf-8') as f:
        json.dump(cmd_data, f, indent=4)

    print("Commands imported successfully.")

if __name__ == "__main__":
    import_commands()
