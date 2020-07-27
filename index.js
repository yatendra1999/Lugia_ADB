const {remote, Tray, shell} = require('electron')
const {PythonShell} = require('python-shell')
const path = require('path');
const exec = require('child_process').exec
const fs = require('fs')

function set_info(element){
    var device_id = element.id;
    active_device = document.getElementById("active_device").innerHTML;
    console.log("Active Device: "+active_device);
    if(active_device != device_id){
        document.getElementById("active_device").innerHTML = device_id;
        console.log("Setting active device : "+device_id);
    }

    var cmd_path = ("cd "+__dirname+" &&");

    child = exec( cmd_path+"adb devices -l", function(err, stdout, stderr){
        devices = stdout.split("\n");
        for(let entry in devices){
            id = devices[entry].split(' ')[0];
            id = id.split(':')[0];
            if(id == device_id){
                var ip = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

                let dev_info = document.getElementById("adb_info");
                dev_info.textContent = "";
                parsed_info = devices[entry].split(" ");
                var filtered = parsed_info.filter(function (el) {
                    return el != "";
                });
                console.log(filtered);
                // <li class="list-group-item">Dapibus ac facilisis in</li>
                
                // ID
                var value = filtered[0].split(":")[0];
                var info_element = document.createElement('li');
                info_element.classList = "list-group-item";
                var info_text = document.createTextNode("ID: "+value);
                info_element.appendChild(info_text);
                dev_info.appendChild(info_element);

                if(ip.test(value)){
                    info_element = document.createElement('li');
                    info_element.classList = "list-group-item";
                    info_text = document.createTextNode("Over WiFi: YES");
                    info_element.appendChild(info_text);
                    dev_info.appendChild(info_element);
                }
                else{
                    info_element = document.createElement('li');
                    info_element.classList = "list-group-item";
                    info_text = document.createTextNode("Over WiFi: NO");
                    info_element.appendChild(info_text);
                    dev_info.appendChild(info_element);
                }
                
                //authorization
                value = filtered[1];
                if(value=="device"){
                    value = "authorized";
                }
                info_element = document.createElement('li');
                info_element.classList = "list-group-item";
                info_text = document.createTextNode("State: "+value);
                info_element.appendChild(info_text);
                dev_info.appendChild(info_element);

                //Product
                value = filtered[2].split(':')[1];
                info_element = document.createElement('li');
                info_element.classList = "list-group-item";
                info_text = document.createTextNode("Product: "+value);
                info_element.appendChild(info_text);
                dev_info.appendChild(info_element);

                //Device
                value = filtered[4].split(':')[1];
                info_element = document.createElement('li');
                info_element.classList = "list-group-item";
                info_text = document.createTextNode("Device: "+value);
                info_element.appendChild(info_text);
                dev_info.appendChild(info_element);

            }
        }
    })
}

function refresh_devices(){
    var cmd_path = ("cd "+__dirname+" &&");
    console.log("adb Path:"+cmd_path);
    exec(cmd_path+"adb devices -l", function(err, stdout, stderr){
        var list = document.getElementById("adb_list");
        list.textContent = "";
        devices = stdout.split("\n");
        // console.log(stdout);
        console.log(devices);
        verified_list = [];
        for(let entry in devices){
            var hex = /^[0-9A-Fa-f]+$/;
            var ip = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            id = devices[entry].split(' ')[0];
            id = id.split(":")[0];
            console.log(id);
            if(hex.test(id) || ip.test(id)){
                console.log("valid");
                list_element = document.getElementById('adb_list');
                var btn = document.createElement("button");
                btn.id = id;
                var text = document.createTextNode(id);
                btn.appendChild(text);
                btn.type = "button";
                btn.classList = "list-group-item list-group-item-action";
                list_element.appendChild(btn);
                btn.addEventListener("click", function(btn){
                    set_info(this);
                })
            }
            else{
                console.log("invalid");
            }
        }
    })
}

const connect_form = document.getElementById('tcpip_add')
connect_form.addEventListener('submit', function(event){
    event.preventDefault();
    console.log(event);
    console.log(event.target);
    console.log(event.target[0]);
    console.log(event.target[0].value);
    input_ip = event.target[0].value;
    add_wifi_device(input_ip);
})

function add_wifi_device(address){
    var ip = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if(ip.test(address)){
        var cmd_path = ("cd "+__dirname+" &&");

        child = exec(cmd_path+"adb connect "+address, function(err, stdout, stderr){
            if (err) throw err;
            console.log(stdout);
        })
        child.on('exit', function(code){
            refresh_devices();
        })
    }
    else{
        console.log("Worng Format of IP address used!");
    }

}

refresh_adb = document.getElementById('refresh-adb');
refresh_adb.addEventListener('click',refresh_devices);


// complete fly section javascript is managed here
current_coords = -1

const form = document.getElementById("Fly-coord")
form.addEventListener('submit',function(event){
    event.preventDefault();
    active_device = document.getElementById("active_device").innerHTML;
    var hex = /^[0-9A-Fa-f]+$/;
    var ip = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    var cmd_path = ("cd "+__dirname+" &&");

    if(hex.test(active_device) || ip.test(active_device)){
        entered_coords = event.target[0].value;
        console.log(event);
        if (event.target[1].checked == true){
            // fly_path = path.join(__dirname,"fly.py")
            current_coords = entered_coords;
            temp = current_coords.split(',');
            document.getElementById("curr_lat").innerText = "Latitude : " + temp[0];
            document.getElementById("curr_lon").innerText = "Longitude : " + temp[1];
            // options = {
            //     mode: 'text',
            //     pythonOptions: ['-u']
            // };
            // options.args = ['fly', current_coords]
            // PythonShell.run(fly_path, options, function(err, results){
            //     if (err) throw err;
            //     console.log(results[0]);
            // })
            fly_command = cmd_path+"adb -s " + active_device + " shell am start-foreground-service -a theappninjas.gpsjoystick.TELEPORT --ef lat " + temp[0] + " --ef lng " + temp[1];
            child = exec(fly_command, function(err, stdout, stderr){
                if (err) throw err;
                console.log(stdout);
            })
        }
        else{
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
                        current_coords = entered_coords;
                        temp = current_coords.split(',');
                        console.log("Cooldown over!")
                        // console.log(temp)
                        document.getElementById("curr_lat").innerText = "Latitude : " + temp[0];
                        document.getElementById("curr_lon").innerText = "Longitude : " + temp[1];
                        cd_bar.style.display = 'none';
                        // options = {
                        //     mode: 'text',
                        //     pythonOptions: ['-u']
                        // };
                        // options.args = ['fly', current_coords]
                        // PythonShell.run(fly_path, options, function(err, results){
                        //     if (err) throw err;
                        //     console.log(results[0]);
                        // })
                        fly_command = cmd_path+"adb -s " + active_device + " shell am start-foreground-service -a theappninjas.gpsjoystick.TELEPORT --ef lat " + temp[0] + " --ef lng " + temp[1];
                        child = exec(fly_command, function(err, stdout, stderr){
                            if (err) throw err;
                            console.log(stdout);
                        })
                    }
                }
                setTimeout(update_progress,cd)
            })
        }
    }
    else{
        console.log("No Device Selected!");
    }
    

    // console.log(entered_coords)
    
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