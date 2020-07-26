import sys
import subprocess
import re
import socket

class adb_device:
    
    id = "not yet set"
    tcpip = False
    usb_id = None
    authorized = False
    product = "not known"
    model = "not known"
    device = "not known"
    transport = None

    def __init__(self, id, tcpip=False, usb_id = None):
        id = id.split(":")
        self.id = id[0]
        self.tcpip = tcpip
        if tcpip == False:
            self.usb_id = usb_id
        else:
            self.tcpip_port = id[1]
    
    def __str__(self):
        string = '{ "id": '+ f'"{self.id}",' + ' "tcpip": ' + f'"{self.tcpip}",'+ ' "authorized": ' + f'"{self.authorized}",'+ ' "product": ' + f'"{self.product}",'+ ' "model": ' + f'"{self.model}",'+ ' "device": ' + f'"{self.device}",'+ ' "transport": ' + f'"{self.transport}"' + '}'
        return string

def parse_device_info(device):
    device = device.split(' ')
    pop = []
    for i in range(len(device)):
        if len(device[i]) == 0:
            pop.append(i)
    pop = reversed(pop)
    for item in pop:
        device.pop(item)

    try:
        socket.inet_aton(device[0].split(':')[0])
        id = device[0]
        adb_entry = adb_device(id, True)
    except socket.error:
        id = device[0]
        adb_entry = adb_device(id, False, device[2].split(':')[1])
    device.pop(0)
    
    if device[0] == "device":
        adb_entry.authorized = True
    else:
        adb_entry.authorized = False
    device.pop(0)

    if adb_entry.tcpip == False:
        device.pop(0)
    
    adb_entry.product = device[0].split(':')[1]
    device.pop(0)
    adb_entry.model = device[0].split(':')[1]
    device.pop(0)
    adb_entry.device = device[0].split(':')[1]
    device.pop(0)
    adb_entry.transport = device[0].split(':')[1]

    return adb_entry

def get_devices():
    result = subprocess.run(['adb','devices','-l'], stdout=subprocess.PIPE)
    devices = result.stdout.decode('utf-8')
    devices = devices.split('\n')
    devices = devices[1:-2]
    adb_list = []
    for device in devices:
        adb_list.append(parse_device_info(device))
    return adb_list

def get_info_by_id(id):
    pass

if __name__ == "__main__":
    arguments = sys.argv[1:]
    if len(arguments) == 0:
        pass
    else:
        if arguments[0] == 'list':
            device_list = get_devices()
            string = '{"num_devices":'+f'{len(device_list)}'
            for idx in range(len(device_list)):
                string = string + ', ' + f'"device_{idx}":' + f'"{device_list[idx].id}"'
            string = string + '}'
            print(string)
        if arguments[0] == 'info':
            device_id = arguments[1]
            device_list = get_devices()
            for device in device_list:
                if device.id == device_id:
                    print(device)
                    break