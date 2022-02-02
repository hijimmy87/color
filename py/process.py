import csv, os
import numpy as np
import cv2
from colormath.color_objects import HSVColor, LabColor, sRGBColor
from colormath.color_conversions import convert_color
from colormath.color_diff import delta_e_cie1976


for seq in ['1st', '2nd']:
    results = [[0 for _ in range(3)] for _ in range(8)]
    colors = {}
    print(seq+':')
    for filename in os.listdir(f'./{seq}_raw'):
        # Process the image
        img = cv2.imread(f'./{seq}_raw/{filename}')
        img = cv2.resize(img, (1000, 1000))
        img = cv2.medianBlur(img, 9)
        
        # mask
        mask  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(mask, 235, 255, cv2.THRESH_BINARY)
        
        
        # Replace white
        img[mask > 0] = (255,255,255)
        cv2.imwrite(f'./{seq}_prcessed/{filename}', img)
        
        # Analyze
        mask = cv2.bitwise_not(mask)
        count = cv2.countNonZero(mask)
        rgb = tuple(map(lambda x: x / 255, cv2.mean(img, mask=mask)))[:3]
        rgb = sRGBColor(*rgb, is_upscaled=True)
        hsv = convert_color(rgb, HSVColor)
        value = list(hsv.get_value_tuple())
        value[1] *= 100
        value[2] *= 100
        value = 'hsv({}°, {}%, {}%)'.format(*map(lambda x: round(x, 2), value))
        # Recording
        print(filename, count,value, sep='\n', end='\n\n')
        colors.update({filename: hsv})
        row, col = (int(filename[2])-1)*4, int(filename[0])-1
        if 'after' in filename:
            row +=2
        results[row][col] = count
        results[row+1][col] = value
    
    # DeltaE CIE 1976
    for number in [f'{i}-{j}' for i in [1,2,3] for j in [1,2]]:
        before = colors[number + '_before.jpg']
        after  = colors[number + '_after.jpg']
        convertColor = lambda color: convert_color(color, LabColor)
        deltaE = delta_e_cie1976(*map(convertColor, [before, after]))
        print(number + ':', round(deltaE, 2))
    # Logging results in CSV
    with open(seq+'.csv','w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(results)
    print('----------')

for seq in ['1st', '2nd']:
    results = [[] for _ in range(8)]
    colors = {}
    print(seq+':')
    for filename in os.listdir(f'./{seq}_processed'):
        # Process the image
        img = cv2.imread(f'./{seq}_processed/{filename}')
        
        # Analyze
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        lower = np.array((0,0,0),img.dtype)
        upper = np.array((254,244,254),img.dtype)
        gray = cv2.inRange(img, lower, upper)
        count = cv2.countNonZero(gray)
        rgb = tuple(map(lambda x: x / 255, cv2.mean(img, mask=gray)))[:3]
        rgb = sRGBColor(*rgb)
        hsv = convert_color(rgb, HSVColor)
        value = list(hsv.get_value_tuple())
        value[1] *= 100
        value[2] *= 100
        
        # Recording
        hsvStr = 'hsv({}°, {}%, {}%)'.format(*map(lambda x: round(x, 2), value))
        rgbStr = 'rgb({}, {}, {})'.format(*rgb.get_upscaled_value_tuple())
        print(filename, count,hsvStr,rgbStr, sep='\n', end='\n\n')
        colors.update({filename: hsv})
        row, col = (int(filename[2])-1)*4, int(filename[0])-1
        if 'after' in filename:
            row +=2
        results[row].append(count)
        results[row+1].append(value[0])
        results[row+1].append(value[1])
        results[row+1].append(value[2])
    
    # DeltaE CIE 1976
    for number in [f'{i}-{j}' for i in [1,2,3] for j in [1,2]]:
        before = colors[number + '_before.jpg']
        after  = colors[number + '_after.jpg']
        convertColor = lambda color: convert_color(color, LabColor)
        deltaE = delta_e_cie1976(*map(convertColor, [before, after]))
        print(number + ':', deltaE)
    # Logging results in CSV
    with open(seq+'.csv','w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(results)
    print('----------')