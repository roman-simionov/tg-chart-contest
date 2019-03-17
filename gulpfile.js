const gulp = require("gulp");
const spawn = require('child_process').spawn;

gulp.task("webpack", function(done) {
    const webpack = spawn("npm", ["run", "build-dev"]);
    const data = [];
    webpack.stdout.on("data", (d) => {
        data.push(d.toString());
    });
    webpack.stderr.pipe(process.stdout);

    webpack.on("exit", (code) => {
        if (code !== 0) {
            console.log(data.join(""));
        }
        done();
    });
});

gulp.task("default", function(done) {
    gulp.watch(["./**/*.js", "!./node_modules"], ["webpack"]);
    done();
});
