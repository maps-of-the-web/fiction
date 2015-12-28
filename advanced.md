## Automatically Filling in Edge IDs using Regex

Find incomplete entries using:
```javascript
/"source": "(.+)",\n(\s+)"target": "(.+)",\n(\s+)"id": "",/
```

Replace with: 
```javascript
/"source": "$1",\n$2"target": "$3",\n$4"id": "$1+$3",/
```
