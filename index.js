const {remote, Tray, shell} = require('electron')
const {PythonShell} = require('python-shell')

about = document.getElementById("about")
about.addEventListener('click', function(){
    document.getElementById('about_section').style.display = 'block';
    document.getElementById('devices_section').style.display = 'none';
    document.getElementById('routes_section').style.display = 'none';
    document.getElementById('teleport_section').style.display = 'none';
})

devices = document.getElementById('devices')
devices.addEventListener('click', function(){
    document.getElementById('about_section').style.display = 'none';
    document.getElementById('devices_section').style.display = 'block';
    document.getElementById('routes_section').style.display = 'none';
    document.getElementById('teleport_section').style.display = 'none';
})

routes = document.getElementById('routes')
routes.addEventListener('click', function(){
    document.getElementById('about_section').style.display = 'none';
    document.getElementById('devices_section').style.display = 'none';
    document.getElementById('routes_section').style.display = 'block';
    document.getElementById('teleport_section').style.display = 'none';
})

teleport = document.getElementById('teleport')
teleport.addEventListener('click', function(){
    document.getElementById('about_section').style.display = 'none';
    document.getElementById('devices_section').style.display = 'none';
    document.getElementById('routes_section').style.display = 'none';
    document.getElementById('teleport_section').style.display = 'block';
})

github_link = document.getElementById('github-open')
github_link.addEventListener('click', function(){
    shell.openExternal("https://github.com/yatendra1999/Lugia_ADB")
})

discord_link = document.getElementById('discord-open')
discord_link.addEventListener('click', function(){
    shell.openExternal("https://discord.gg/p3Cpwk")
})