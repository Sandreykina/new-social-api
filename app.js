const express = require("express");
const fs = require("fs");
const config = require('config');

const app = express();
var cors = require('cors');
app.use(cors());

const jsonParser = express.json();

app.use(express.static(__dirname + "/public"));

const filePath = "posts.json";
const filePathProfileInfo = "profileData.json";
app.get("/api/posts", function (req, res) {

    const content = fs.readFileSync(filePath, "utf8");
    const posts = JSON.parse(content);
    res.send(posts);
});
//получение данных профиля
app.get("/api/profile", function (req, res) {

    const content = fs.readFileSync(filePathProfileInfo, "utf8");
    const profileData = JSON.parse(content);
    res.send(profileData);
});
// получение одного поста по id
app.get("/api/posts/:id", function (req, res) {

    const id = req.params.id; // получаем id
    const content = fs.readFileSync(filePath, "utf8");
    const posts = JSON.parse(content);
    let post = null;
    // находим в массиве пост по id
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].id == id) {
            post = posts[i];
            break;
        }
    }
    // отправляем пост
    if (post) {
        res.send(post);
    }
    else {
        res.status(404).send();
    }
});
// добавление поста
app.post("/api/posts", jsonParser, function (req, res) {

    if (!req.body) return res.sendStatus(400);

    const postTitle = req.body.title;
    const postDescription = req.body.description;
    const postImg = req.body.img;
    let post = { title: postTitle, description: postDescription, img: postImg };

    let data = fs.readFileSync(filePath, "utf8");
    let posts = JSON.parse(data);

    // находим максимальный id
    const id = Math.max.apply(Math, posts.map(function (o) { return o.id; }))
    // увеличиваем его на единицу
    post.id = id + 1;
    // добавляем пост в массив
    posts.push(post);
    data = JSON.stringify(posts);
    // перезаписываем файл с новыми данными
    fs.writeFileSync("posts.json", data);
    res.send(post);
});
// удаление поста по id
app.delete("/api/posts/:id", function (req, res) {

    const id = req.params.id;
    let data = fs.readFileSync(filePath, "utf8");
    let posts = JSON.parse(data);
    let index = -1;
    // находим индекс поста в массиве
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].id == id) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        // удаляем пост из массива по индексу
        const post = posts.splice(index, 1)[0];
        data = JSON.stringify(posts);
        fs.writeFileSync("posts.json", data);
        // отправляем удаленного поста
        res.send(post);
    }
    else {
        res.status(404).send();
    }
});

// изменение лайка
app.put("/api/posts/:id", jsonParser, function (req, res) {
    const postId = req.params.id;

    let data = fs.readFileSync(filePath, "utf8");
    const posts = JSON.parse(data);
    let post;
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].id == postId) {
            post = posts[i];
            break;
        }
    }
    // изменяем данные поста
    if (post) {
        post.likeCount = post.isLiked ?  post.likeCount - 1 : post.likeCount + 1;
        post.isLiked = !post.isLiked;
        data = JSON.stringify(posts);
        fs.writeFileSync("posts.json", data);
        res.send(post);
    }
    else {
        res.status(404).send(post);
    }
});


app.listen(5000, function () {
    console.log(`Сервер бэка азпущен с портом 5000}`);
});
