import math
import os
import sys

cd_dict = {1:30,5:120,10:360,25:660,30:840,65:1320,81:1500,100:2100,250:2700,500:3600,750:4680,1000:5400,1500:7200}
d_list = [1,5,10,25,30,65,81,100,250,500,750,1000,1500]

def get_cooldown(dist):
    dist = math.ceil(dist)
    for i in range(len(d_list)):
        if dist <= d_list[i]:
            return cd_dict[d_list[i]]
    return 7200

def distance_km(entry1, entry2):
    lat1 = entry1.lat
    lon1 = entry1.lon
    lat2 = entry2.lat
    lon2 = entry2.lon
    radius = 6371 # km

    dlat = math.radians(lat2-lat1)
    dlon = math.radians(lon2-lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    d = radius * c

    return d

class location:

    def __init__(self, lat, lon):
        self.lat = lat
        self.lon = lon

    def get_cd(self, new_location):
        dist = distance_km(self, new_location)
        time = get_cooldown(dist)
        # print("Distance:",dist)
        return time

if __name__ == "__main__":
    params = sys.argv[1:]
    if params[0] == "getcd":
        curr_lat    = float(params[1].split(",")[0])
        curr_lon    = float(params[1].split(",")[1])
        new_lat     = float(params[2].split(",")[0])
        new_lon     = float(params[2].split(",")[1])
        curr_loc = location(curr_lat, curr_lon)
        new_loc = location(new_lat, new_lon)
        cooldown = curr_loc.get_cd(new_loc)
        print('{"cooldown": '+f'{cooldown}'+'}')
    if params[0] == "fly":
        lat = float(params[1].split(',')[0])
        lon = float(params[1].split(',')[1])
        os.system(f"adb shell am start-foreground-service -a theappninjas.gpsjoystick.TELEPORT --ef lat {lat} --ef lng {lon}")