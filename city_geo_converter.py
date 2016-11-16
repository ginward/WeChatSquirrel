"""
Author: Jinhua Wang
Nov 2016
A tool that converts city database into json format
database: https://www.maxmind.com/en/free-world-cities-database
"""

import csv 
import sys #used for passing in the argument
import json
"""
Aggreate the longitudes and latitudes of the same geoname_id in the dictionary
"""
def aggregateLatLong(dictionary, longitude, latitude, geoname_id):
	if geoname_id in dictionary:
		print "Aggregating longitude: "+longitude+" and latitude: "+latitude
		print longitude
		dictionary[geoname_id][0]=(float(dictionary[geoname_id][0])+float(longitude))/2
		dictionary[geoname_id][1]=(float(dictionary[geoname_id][1])+float(latitude))/2

"""
The first argument passed in should be 
the file containing the IP addresses, Longitudes and Latitudes
the longitudes and latitudes of the cities should be averaged 
because WeChat only provides us with the city names
"""
print "Processing the longitudes and latitudes ..."
file_path=sys.argv[1]
long_lat_dict={} #{geoname_id:[longitude, latitude]}
with open(file_path, 'rU') as f:
	reader = csv.reader(f)
	reader.next() #start from the second rowc
	#print the values
	for row in reader:
		tmp_geoname=row[1]
		tmp_long=row[8]
		tmp_lat=row[7]
		tmp_list=[]
		tmp_list.append(tmp_long)
		tmp_list.append(tmp_lat)
		long_lat_dict[tmp_geoname]=tmp_list
		if tmp_long and tmp_lat:
			aggregateLatLong(long_lat_dict, tmp_long, tmp_lat, tmp_geoname)
		else:
			print "found empty cells. ignoring..."
		print long_lat_dict[tmp_geoname]
		print "-----------"

print "total number of records proccessed:"+str(len(long_lat_dict))

"""
The second argument passed in should be 
the file containing the city names 
"""

print "Processing the city names ..."
city_file_path=sys.argv[2]
city_dict={} #{geoname_id:city_name}
with open(city_file_path,'rU') as c:
		reader_city=csv.reader(c)
		reader_city.next()#start from the second line
		for row in reader_city:
			tmp_geoname=row[0]
			tmp_cityname=row[10]
			if tmp_cityname and tmp_geoname:
				city_dict[tmp_geoname]=tmp_cityname
			else:
				print "skipping empty city cells"
				continue
			print city_dict[tmp_geoname]
			print "-----------"	

print "total number of cities"+str(len(city_dict))

"""
Consctrut the city and longitude, latitude relationship
"""
location_dict={}
for key in city_dict:
	if key in long_lat_dict:
		location_dict[city_dict[key]]=long_lat_dict[key]
		print "key found" + str(key)
print location_dict
print "writing json to file..."
with open('location.json', 'w') as outfile:
	json.dump(location_dict, outfile)
