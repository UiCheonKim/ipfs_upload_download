# ipfs_upload_download
/tmp_upload

-> multipart/form-data 
-> formidable사용, tmp에 파일이 생성된다
-> tmp에 파일 저장 api

/memory_upload

-> multipart/form-data
-> multer 사용, memory storage를 이용
-> 매우 큰 사이즈의 파일을 업로드 하거나 많은 양의 비교적 작은 파일들을 매우 빠르게 업로드 하는 경우 응용 프로그램의 메모리 부족이 발생 할 수 있음
-> tmp_upload와 같이 tmp 파일을 생성하고 ipfs에 업로드 되는 api

/final_upload

-> multipart/form-data
-> multer 사용, memory storage를 이용
-> 매우 큰 사이즈의 파일을 업로드 하거나 많은 양의 비교적 작은 파일들을 매우 빠르게 업로드 하는 경우 응용 프로그램의 메모리 부족이 발생 할 수 있음
-> tmp 에 저장 하지 않고 메모리 스토리지를 이용하여 파일을 불러오고 ipfs에 저장하는 api

/final_download

-> application/json
-> final_upload에서 나온 결과값인 cid와 title(ex. example.jpg) 전송
-> ipfs cid에 저장된 image,pdf 등 출력 api

/download/:fileName

-> 리눅스에 저장되어 있는 파일 단순 다운로드 api

/download2/:ipfsId/:fileName

-> 리눅스에 저장되어있는 파일 파라미터로 filename 변경용
-> ipfs와 연결 되어 있지 않음

/ipfs_upload

-> ipfs

/ipfs_localDownload

/tmp_totaltest
