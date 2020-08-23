const {remote, Tray, shell} = require('electron');
const dialog = remote.dialog;
const {PythonShell} = require('python-shell');
const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs');
const { count } = require('console');


//utils

function get_rads(deg){
    return ((deg* Math.PI)/ 180);
}

function get_dist(current_coord, next_coord){
    dist = 0;
    lat1 = current_coord[0];
    lon1 = current_coord[1];
    lat2 = next_coord[0];
    lon2 = next_coord[1];
    radius = 6371;

    dlat = get_rads(lat2-lat1);
    dlon = get_rads(lon2-lon1);
    a = Math.sin(dlat/2);
    a = a*a;
    b = Math.sin(dlon/2);
    b = b*b;
    b = Math.cos(get_rads(lat1)) * Math.cos(get_rads(lat2)) * b;
    a = a + b
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    d = radius * c

    console.log("Distance : " + d);
    return d
}

function get_cd_from_dist(dist){
    cd_dict = {1:30,5:120,10:360,25:660,30:840,65:1320,81:1500,100:2100,250:2700,500:3600,750:4680,1000:5400,1500:7200};
    d_list = [1,5,10,25,30,65,81,100,250,500,750,1000,1500];
    dist = Math.ceil(dist)
    for(i=0; i<d_list.length; i++){
        if(dist <= d_list[i]){
            return cd_dict[d_list[i]];
        }
    }
    return 7200
}

function get_cd(current_coord, next_coord){
    console.log(current_coord, next_coord);
    curr = current_coord.split(',');
    curr[0] = parseFloat(curr[0]);
    curr[1] = parseFloat(curr[1]);
    next = next_coord.split(',');
    next[0] = parseFloat(next[0]);
    next[1] = parseFloat(next[1]);
    console.log(curr, next);
    dist = get_dist(curr, next);
    cd = get_cd_from_dist(dist)
    console.log("calculated CD : " + cd);
    return cd
}




// devices section start
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

//devices section end


// complete fly section javascript is managed here

function disable_fly(){
    document.getElementById('teleport_button').disabled = true;
}

function enable_fly(){
    document.getElementById('teleport_button').disabled = false;
}


const form = document.getElementById("Fly-coord")
form.addEventListener('submit',function(event){
    current_coords = document.getElementById("global_coords").innerHTML;
    event.preventDefault();
    active_device = document.getElementById("active_device").innerHTML;
    var hex = /^[0-9A-Fa-f]+$/;
    var ip = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    var cmd_path = ("cd "+__dirname+" &&");

    if(hex.test(active_device) || ip.test(active_device)){
        entered_coords = event.target[0].value;
        console.log(event);
        if (event.target[1].checked == true){
            current_coords = entered_coords;
            temp = current_coords.split(',');
            document.getElementById("curr_lat").innerText = "Latitude : " + temp[0];
            document.getElementById("curr_lon").innerText = "Longitude : " + temp[1];
            fly_command = cmd_path+"adb -s " + active_device + " shell am start-foreground-service -a theappninjas.gpsjoystick.TELEPORT --ef lat " + temp[0] + " --ef lng " + temp[1];
            child = exec(fly_command, function(err, stdout, stderr){
                if (err) throw err;
                console.log(stdout);
            })
            document.getElementById("global_coords").innerHTML = current_coords;
            document.getElementById("route_current_location").innerHTML = "Current coords: "+current_coords;

        }
        else{
            disable_fly();
            disable_coords_loading();
            if(current_coords == "-1"){
                current_coords = entered_coords;
            }
            cd = get_cd(entered_coords, current_coords);
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
                    document.getElementById("curr_lat").innerText = "Latitude : " + temp[0];
                    document.getElementById("curr_lon").innerText = "Longitude : " + temp[1];
                    cd_bar.style.display = 'none';
                    fly_command = cmd_path+"adb -s " + active_device + " shell am start-foreground-service -a theappninjas.gpsjoystick.TELEPORT --ef lat " + temp[0] + " --ef lng " + temp[1];
                    child = exec(fly_command, function(err, stdout, stderr){
                        if (err) throw err;
                        console.log(stdout);
                    })
                    document.getElementById("global_coords").innerHTML = current_coords;
                    document.getElementById("route_current_location").innerHTML = "Current coords: "+current_coords;
                    enable_fly();
                    enable_coords_loading();
                }
            }
            setTimeout(update_progress,cd);
        }
    }
    else{
        console.log("No Device Selected!");
    }
    

    // console.log(entered_coords)
    
})
//teleport section end



//routes section start

function disable_coords_loading(){
    document.getElementById('load_routes').disabled = true;
}

function enable_coords_loading(){
    document.getElementById('load_routes').disabled = false;
}

function unhide_options(){
    document.getElementById('route_cancel').style.display = "inline-block";
    document.getElementById('route_skip_next').style.display = "inline-block";
    document.getElementById('route_jump_next').style.display = "inline-block";
}
function hide_options(){
    document.getElementById('route_cancel').style.display = "none";
    document.getElementById('route_skip_next').style.display = "none";
    document.getElementById('route_jump_next').style.display = "none";
}

function remove_listeners(){

    var old_element = document.getElementById("route_cancel");
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);

    var old_element = document.getElementById("route_skip_next");
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);

    var old_element = document.getElementById("route_jump_next");
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);
}

function exit_route(){
    console.log("Exiting the route")
    hide_options();
    document.getElementById('route_active').innerHTML = 'false';
    enable_coords_loading();
    enable_fly();
    document.getElementById("route_next_stop_info").innerHTML = "Next Stop : N/A";
}

function route_skipper(coord_list, count){
    console.log("skipping route");
    count = count + 1;
    remove_listeners();

    if(coord_list.length > count){
        set_cooldown(coord_list, count);
    }
    else{
        exit_route();
    }
}

function jump_next(coord_list, count){
    console.log("Jumping to next");
    remove_listeners();

    hide_options();

    if(coord_list.length > count){
        active_device = document.getElementById("active_device").innerHTML;
        cmd_path = ("cd "+__dirname+" &&");
    
        last_coord = coord_list[count-1];
        // console.log(count-1);
        // console.log(last_coord);
        next_coord = coord_list[count];
        
        cd = get_cd(last_coord, next_coord);
        cd = cd * 10;
        cd_bar = document.getElementById('route_cooldown_bar');
        cd_bar.style.display = 'flex';
        var per = 0;
        cd_bar.style.width = per+"%";
        function update_progress(){
            cd_bar.style.width = per+"%";
            per += 1;
            console.log("progress: "+per+"%");
            if(per<100){
                setTimeout(update_progress,cd);
            }
            else{
                temp = next_coord.split(',');
                console.log("Cooldown over!")
                cd_bar.style.display = 'none';
                fly_command = cmd_path+"adb -s " + active_device + " shell am start-foreground-service -a theappninjas.gpsjoystick.TELEPORT --ef lat " + temp[0] + " --ef lng " + temp[1];
                child = exec(fly_command, function(err, stdout, stderr){
                    if (err) throw err;
                    // console.log(stdout);
                })
                document.getElementById("global_coords").innerHTML = next_coord;
                child.on('exit', function(){
                    count = count + 1;
                    set_cooldown(coord_list, count);
                    document.getElementById("route_current_location").innerHTML = "Current coords: " + next_coord;
                    temp = next_coord.split(',');
                    document.getElementById("curr_lat").innerText = "Latitude : " + temp[0];
                    document.getElementById("curr_lon").innerText = "Longitude : " + temp[1];
                })
            }
        }
        setTimeout(update_progress,cd);
    }
    else{
        exit_route();
    }

   
}

function set_cooldown(coord_list, count){
    console.log(count);
    next_coord = coord_list[count];

    document.getElementById("route_next_stop_info").innerHTML = "Next Stop : " + next_coord;
    unhide_options();

    document.getElementById('route_cancel').addEventListener('click', exit_route);
    document.getElementById('route_skip_next').addEventListener('click', route_skipper.bind(this,coord_list, count));
    document.getElementById('route_jump_next').addEventListener('click', jump_next.bind(this,coord_list, count));
}

function start_jumping(coord_list){
    // console.log(valid_list);
    console.log("started route!");
    active_device = document.getElementById("active_device").innerHTML;
    var hex = /^[0-9A-Fa-f]+$/;
    var ip = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    var cmd_path = ("cd "+__dirname+" &&");
    if(hex.test(active_device) || ip.test(active_device)){
        var count = 0;
        current_coords = coord_list[count];
        console.log(current_coords);
        temp = current_coords.split(',');
        fly_command = cmd_path+"adb -s " + active_device + " shell am start-foreground-service -a theappninjas.gpsjoystick.TELEPORT --ef lat " + temp[0] + " --ef lng " + temp[1];
        child = exec(fly_command, function(err, stdout, stderr){
            if (err) throw err;
            // console.log(stdout);
        })
        document.getElementById("global_coords").innerHTML = current_coords;
        document.getElementById("route_current_location").innerHTML = "Current coords: "+current_coords;
        temp = current_coords.split(',');
        document.getElementById("curr_lat").innerText = "Latitude : " + temp[0];
        document.getElementById("curr_lon").innerText = "Longitude : " + temp[1];
        count += 1;
        if(coord_list.length > count){
            // console.log(coord_list.length);
            set_cooldown(coord_list, count);
        }
        else{
            // console.log(coord_list.length);
            // console.log(count);
            exit_route();
        }
    }
    else{
        console.log("No device selected!");
        exit_route();
    }

}

function start_route(){
    if(document.getElementById('route_active').innerHTML == "false"){
        file = dialog.showOpenDialogSync();
        if(file){
            disable_coords_loading();
            disable_fly();
            console.log(file);
            file = file[0];
            coord_list = fs.readFileSync(file, {encoding:'utf-8', flag:'r'});
            console.log(coord_list);
            coord_list = coord_list.split("\n");
            console.log(coord_list);
            coord_re = /^(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)\s*$/;
            valid_list = [];
            for( coord_idx in coord_list){
                val = coord_list[coord_idx];
                if (coord_re.test(val)){
                    console.log("valid : " + val);
                    valid_list.push(val);
                }
                else{
                    console.log("invalid : "+ val);
                }
            }
            var prev_coord = document.getElementById("global_coords").innerHTML;
            if(prev_coord != '-1'){
                valid_list.unshift(prev_coord);
            }
            start_jumping(valid_list);
        }
        else{
            console.log("No file specified!")
        }
    }
    else{
        console.log("A route is already active!")
    }
}

load_routes = document.getElementById('load_routes');
load_routes.addEventListener('click', start_route);
//routes section end




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