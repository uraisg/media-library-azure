import json


def get_coordinate(coordinate):
    coordinate = str(coordinate).replace('[', '')
    coordinate = coordinate.replace(']', '')
    coordinate = coordinate.split(',')
    return ''.join(coordinate) + ', '


def convertRegion(region):
    match region:
        case "NORTH REGION":
            return 1
        case "EAST REGION":
            return 2
        case "WEST REGION":
            return 3
        case "CENTRAL REGION":
            return 4
        case "NORTH-EAST REGION":
            return 5


def convertCentralArea(ca_ind):
    match ca_ind:
        case "Y":
            return 1
        case "N":
            return 0


def get_new_data(id, coordinate, area, region, ca_ind):
    new_data = {
            'Id': id,
            'AreaPolygon': f"POLYGON(({coordinate}))",
            'PlanningAreaName': area,
            'RegionId': convertRegion(region),
            'CA_IND': convertCentralArea(ca_ind)
        }
    return new_data


json_file = 'planning-area-boundary.json'

file = open(json_file)

data = json.load(file)
dashboardData = []
polygon_coordinates = []

featureJSON = data['features']

for i in featureJSON:
    coordinates = ''
    for j in i['geometry']['coordinates']:
        for k in j:
            coordinates += get_coordinate(k)
        polygon_coordinates.append(coordinates[:-2])
        coordinates = ''

count = 0
for i in polygon_coordinates:
    newData = get_new_data(count+1, i, data['features'][count]['properties']['PLN_AREA_N'], data['features'][count]["properties"]['REGION_N'], data['features'][count]['properties']['CA_IND'])
    dashboardData.append(newData)
    count += 1

with open('sample.json', 'w') as outfile:
    json.dump(dashboardData, outfile)

file.close()


