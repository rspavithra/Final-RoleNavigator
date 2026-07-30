import requests

try:
    with open('test_resume.pdf', 'rb') as f:
        res = requests.post('http://127.0.0.1:5005/api/extract', files={'file': f})
        print(res.status_code)
        print(res.text)
except Exception as e:
    print(e)
