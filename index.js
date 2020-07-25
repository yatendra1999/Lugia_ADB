const {remote, Tray, shell} = require('electron')
const {PythonShell} = require('python-shell')
const path = require('path');

// let options = {
//     mode: 'text',
//     pythonOptions: ['-u'],
//     scriptPath: 'py/',
//     args: ['list']
//   };

// let adb_devices = {num_devices:0}
// let device_listeners = []
// deep_info = []

// refresh_adb_list = document.getElementById("refresh-adb")
// refresh_adb_list.addEventListener('click', function(){
//     PythonShell.run('devices.py', options, function(err, results){
//         if (err) throw err;
//         console.log("ADB devices loaded!")
//         adb_devices = JSON.parse(results[0])
//         console.log(adb_devices)
//     } )
    
//     var block = document.getElementById("adb_list")
//     block.textContent = '';

//     for(let id in adb_devices){
//         if(id=="num_devices"){
//             console.log("Number of devices :" + adb_devices[id])
//         }else{
//             console.log(adb_devices[id])
//             var btn = document.createElement("button");
//             btn.id = adb_devices[id]
//             var text = document.createTextNode(adb_devices[id])
//             btn.appendChild(text)
//             options = {
//                 mode: 'text',
//                 pythonOptions: ['-u'],
//                 scriptPath: 'py/',
//                 args: ['info',adb_devices[id]]
//             };
//             PythonShell.run('devices.py', options, function(err, results){
//                 if (err) throw err;
//                 // console.log(results)
//                 deep_info[adb_devices[id]] = JSON.parse(results[0])
//                 console.log(deep_info)
//             })
//             if(deep_info.authorized=="False"){
//                 btn.classList = "btn btn-danger"
//             }
//             else{
//                 btn.classList = "btn btn-success"
//             }
//             block.appendChild(btn)
//             device_listeners[id] = document.getElementById(adb_devices[id])
//             device_listeners[id].addEventListener('click', function(){
//                 // [TODO] : complete dialog box
//                 const { dialog } = require('electron').remote
//                 console.log(dialog.showMessageBoxSync(options={message: JSON.stringify(deep_info[adb_devices[id]]), buttons:['OK']}))
//             })
//         }
//     }
// })




// complete fly section javascript is managed here
current_coords = -1

const form = document.getElementById("Fly-coord")
form.addEventListener('submit',function(event){
    event.preventDefault();
    entered_coords = event.target[0].value;
    // console.log(entered_coords)
    let options = {
        mode: 'text',
        pythonOptions: ['-u']
    };
    console.log(options)
    if(current_coords == -1){
        current_coords = entered_coords;
    }
    options.args = ['getcd', entered_coords, current_coords]
    console.log(options.args)
    fly_path = path.join(__dirname,"fly.py")
    PythonShell.run(fly_path, options, function(err, results){
        if (err) throw err;
        console.log(results);
        cd = JSON.parse(results[0]);
        cd = cd.cooldown;
        cd = cd * 10;
        let counter = 0;
        // console.log(cd)
        cd_bar = document.getElementById('cooldown_bar');
        cd_bar.style.display = 'flex';
        var per = 0
        cd_bar.style.width = per+"%";
        function update_progress(){
            cd_bar.style.width = per+"%";
            per += 1;
            console.log("progress: "+per+"%");
            if(per<100){
                setTimeout(update_progress,cd);
            }
            else{
                //[todo] : call actual fly 
                current_coords = entered_coords;
                temp = current_coords.split(',');
                console.log("Cooldown over!")
                console.log(temp)
                document.getElementById("curr_lat").innerText = "Latitude : " + temp[0];
                document.getElementById("curr_lon").innerText = "Longitude : " + temp[1];
                cd_bar.style.display = 'none';
                options = {
                    mode: 'text',
                    pythonOptions: ['-u']
                };
                options.args = ['fly', current_coords]
                PythonShell.run(fly_path, options, function(err){
                    if (err) throw err;
                })
            }
        }
        setTimeout(update_progress,cd)
    })
})



// complete view and rendering javascript is managed here
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