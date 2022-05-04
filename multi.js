//express 불러오기
const { response } = require("express");
const express = require("express");
const { request,http } = require("http");
const bodyParser = require('body-parser');

//express 사용
const app = express();

//포트 번호 설정
const port = 4000;

//http 서버 실행
app.listen(port,() => {
    console.log("server start on 4000");
})

//formidable은 form data를 파싱하거나 파일 업로드를 할때 사용
const formidable = require('formidable')
const mv = require('mv');

const multer  = require('multer')
const iconv = require('iconv-lite'); 
const stream = require('stream');
const urlencode = require('urlencode');


//ipfs
const { create, urlSource, globSource } = require('ipfs-http-client')
const BufferList = require('bl/BufferList')
const ipfs = create('http://211.232.75.147:5001')
//console.log(ipfs)

//파일
var fs = require('fs');

// node.js 모듈(body-parser)
// 클라이언트 POST request data의 body로부터 파라미터를 편리하게 추출
app.use(bodyParser.json());

/*
        false면 기본으로 내장된 querystring 모듈을 사용하고
        true면 따로 설치가 필요한 qs 모듈을 사용하여 쿼리 스트링을 해석
        기존 querystring 모듈과 qs 모듈의 차이는 중첩 객체 처리라고 보면 됨
*/
app.use(express.urlencoded({extended: false}));


app.post('/upload', async function (request,response) {


	//var who = request.body.who;

	
	// form-data 파싱을 위한 form 객체 생성
	var form = new formidable.IncomingForm();
	// parsing
	form.parse(request, (err, fields, files) => {
		console.log(fields, files);
		/*
		console.log(fields.title);
		var oldpath = `/${files.file.filepath}`;
		var newpath = '/home/digitalzone/multipart/upload/' + files.file.originalFilename;
			
		mv(oldpath, newpath, function (err) {
			if (err) throw err;
			response.write('File uploaded and moved!');
			response.end();
		});
		*/
	});
	
        const response1  = {
                success: "true",
                error: null
        }

        response.status(200).send(response1)

});




// 주의: 메모리 스토리지를 사용시, 매우 큰 사이즈의 파일을 업로드 하거나 많은 양의 비교적 작은 파일들을 매우 빠르게 업로드 하는 경우 응용 프로그램의 메모리 부족이 발생 할 수 있음


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.post('/upload2', upload.single('file'), async function (request,response) {


	 console.log(request.file);
	 console.log(request.body.title);

	 //console.log(request.file.buffer.toString());

	
	
	fs.writeFileSync(`/tmp/${request.file.originalname}`, request.file.buffer, 'utf8', (err)=>{
		if(err) {
			console.log(err);
		}
		console.log('save file');
	})

        var file_cid;
        for await (const file of ipfs.addAll(globSource(`/tmp/${request.file.originalname}`, '../../../tmp/*'))) {
                console.log(file)
                file_cid = file.path
        }
 


	fs.unlinkSync(`/tmp/${request.file.originalname}`);


        const response1  = {
                success: "true",
		ipfs_cid : file_cid,
		url : `http://211.232.75.147:8080/ipfs/${file_cid}`,
                error: null
        }

        response.status(200).send(response1)


});

app.post('/final_upload', upload.single('file'), async function (request,response) {

	console.log(request.file);
        console.log(request.body.title);
	console.log(request.file.buffer);

	const file = {
  		content: request.file.buffer
	}

	const result = await ipfs.add(file)
	console.log(result)

	const response1  = {
                success: "true",
                ipfs_cid : result.path,
                error: null
        }

        response.status(200).send(response1)


});

app.post('/final_download', async function (request,response) {


	var cid = request.body.cid;
	var title = request.body.title;


	for await (const file of ipfs.ls(cid)) {
  		console.log(file)
	}


 	const content = new BufferList()

        for await (const file of ipfs.cat(cid)) {
                content.append(file)
	}
	/*
	console.log(content);
	console.log(content._bufs[0]);

	var buf = Buffer.concat([content._bufs[0],content._bufs[1], content._bufs[2],content._bufs[3]]);
	console.log("asdfasfd")
	console.log(buf)
	*/

	
	var buf = Buffer.concat(content._bufs);
	console.log(buf);
	
	/*	
        fs.writeFileSync(`./${title}`, buf, 'utf8', (err)=>{
                if(err) {
                        console.log(err);
                }
                        console.log('save file');
                })
	
	
	*/
	
	/*

        const response1  = {
                success: "true",
                error: null
        }

        response.status(200).send(response1)
	*/
 
	//입력 받은 데이터를 다시 출력해주는 스트림
 	var readStream = new stream.PassThrough();
 	//console.log(readStream);
	readStream.end(buf);

	title = urlencode.encode(title, "UTF-8");
	//title = new String(title.getBytes("UTF-8"), "ISO-8859-1");
 	response.set('Content-disposition', 'attachment; filename=' + title);
	response.set('Content-Type', 'image/jpeg');
 	readStream.pipe(response);

});


app.get('/download/:fileName', async function (request,response) {
	
	var fileName = request.params.fileName;

	var file = './cute.jpg';

	response.download(file, fileName, function(err){
		if(err){
			response.json({err:err});
		}else{
			response.end();
		}
    	})
});

app.get('/download2/:ipfsId/:fileName', async function (request,response) {

        var fileName = request.params.fileName;
	var ipfsId = request.params.ipfsId;
	
	/*
        for await (const ipfscontent of ipfs.cat(ipfsId)) {
		file = ipfscontent.toString();	
        };


        //var file = './cute.jpg';
	//var file = `http://211.232.75.147:8080/ipfs/QmcTUYZnrbDJTtUZnzK3vwStPtSrffXHRndgUSVtTU5ovZ`;

        response.download(file, fileName, function(err){
                if(err){
                        response.json({err:err});
                }else{
                        response.end();
                }
        })

	*/

	var aaa = await fetch(`http://211.232.75.147:8080/ipfs/Qmbc5Y9TNGqi5DtNijparBACJ35nK3akX4FrGc2EkMMbkU`);
	console.log(aaa);

	//response.redirect(`http://211.232.75.147:8080/ipfs/Qmbc5Y9TNGqi5DtNijparBACJ35nK3akX4FrGc2EkMMbkU`);

	//response.redirect(`http://211.232.75.147:8080/ipfs/QmcTUYZnrbDJTtUZnzK3vwStPtSrffXHRndgUSVtTU5ovZ`);

});

app.post('/ipfs_upload', async function (request,response) {

	/*
	const files = [{
		path: './asdf.txt',
		content: 'corgi.txt'
	}];
	*/

	const filepath = './cute.jpg';
	
	for await (const file of ipfs.addAll(globSource(filepath, '**/*'))) {
		console.log(file)
	}

        const response1  = {
                success: "true",
                error: null
        }

	response.status(200).send(response1)


});


app.post('/ipfs_localDownload', async function (request,response) {

	var cid = request.body.cid;
	
	for await (const ipfscontent of ipfs.cat(cid)) {
		cidcontent = ipfscontent.toString();
                fs.writeFileSync('cute1111111111.txt', ipfscontent, 'utf8', (err)=>{
                if(err) {
                        console.log(err);
                }
                        console.log('save file');
                })

	};


	console.log(cidcontent)


        const response1  = {
                success: "true",
                error: null
        }

        response.status(200).send(response1)

});


app.post('/totaltest', async function (request,response) {

        var form = new formidable.IncomingForm();
	var oldpath;
	
	
        var formfields = await new Promise((resolve, reject) => {
            form.parse(request, (err, fields, files) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(files);
            }); // form.parse
        });

	console.log(formfields);


	var file_cid;
        for await (const file of ipfs.addAll(globSource(`${formfields.file.filepath}`, '../../../tmp/*'))) {
                console.log(file)
		file_cid = file.path
        }

	fs.unlinkSync(`${formfields.file.filepath}`);

	console.log(file_cid);

        const response1  = {
                success: "true",
		ipfs_cid : file_cid,
                error: null
        }

        response.status(200).send(response1)

});
