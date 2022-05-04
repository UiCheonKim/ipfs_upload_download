//express 불러오기
const { response } = require("express");
const express = require("express");
const { request } = require("http");
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
	//console.log(form);
	//console.log("----------------------------------------------------------");
	// parsing
	form.parse(request, (err, fields, files) => {
		console.log(fields,files);
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

app.get('/download/:fileName', async function (request,response) {
	
	var fileName = request.params.fileName;

	//var fileName = request.body.fileName;

	var file = './cute.jpg';

	response.download(file, fileName, function(err){
		if(err){
			response.json({err:err});
		}else{
			response.end();
		}
    	})
});

app.post('/ipfs_upload', async function (request,response) {

	/*
	const files = [{
		path: './asdf.txt',
		content: 'corgi.txt'
	}];
	*/

	const filepath = './cute.jpg';

	/*
		const data = 'Hello, corgi';
		const result = await ipfs.add(data);
		console.log("ipfs cid: ", result);
	*/

	
	for await (const file of ipfs.addAll(globSource(filepath, '**/*'))) {
		console.log(file)
	}
	
	

	/*
	for await (const file of ipfs.ls(cid)) {
 		console.log(file)
	}
	*/

        const response1  = {
                success: "true",
                error: null
        }

	response.status(200).send(response1)


});


app.post('/ipfs_localDownload', async function (request,response) {

	var cid = request.body.cid;
	//var cidcontent;	

	
	for await (const ipfscontent of ipfs.cat(cid)) {
		cidcontent = ipfscontent.toString();
                fs.writeFileSync('cute1111111111.txt', ipfscontent, 'utf8', (err)=>{
                if(err) {
                        console.log(err);
                }
                        console.log('save file');
                })

	};


	/*
	await ipfs.get(cid, function (err, files) {
        files.forEach((file) => {
          console.log(file.path)
          console.log(file.content.toString('utf8'))
        })
      })
	*/
	
	/*
	for await (const file of ipfs.get(cid)) {
		//console.log(file)
		
		const content = new BufferList()
		for await (const chunk of file.content) {
			content.append(chunk)
		}

		console.log(content.toString())
		
	}
	*/

	/*
	const stream = ipfs.cat(cid)
	var data = ''
	for await (const chunk of stream) {
 	 // chunks of data are returned as a Buffer, convert it back to a string
	  data += chunk.toString()
	}

	console.log(data)
	*/	

	/*
	const aaa = await ipfs.cat(cid)
	console.log(aaa.toString())
	*/

	console.log(cidcontent)


        const response1  = {
                success: "true",
                error: null
        }

        response.status(200).send(response1)

});


app.post('/corgi', async function (request,response) {

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
