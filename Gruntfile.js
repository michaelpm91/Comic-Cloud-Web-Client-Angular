/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    /*grunt.initConfig({
        // Task configuration.

        // Metadata.
        meta: {
            basePath: '../',
            srcPath: 'app/styles/sass/',
            deployPath: 'app/styles/css/'
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                src: 'app/styles/sass/*.scss',
                dest: 'app/styles/css/newmain.css'
            }
        },
        sass: {
            dist: {
                files: {
                    '<%= meta.deployPath %>newmain.css': '<%= meta.srcPath %>*.scss'
                }
            }
        }

    });*/
    grunt.initConfig({
        sass: {
            dist: {
                /*files: [{
                    expand: true,
                    cwd: 'styles',
                    src: ['app/styles/sass/*.scss'],
                    dest: 'app/style/css/',
                    ext: '.css'
                }]*/
                options: {
                    compress: false,
                    sourcemap: 'none'
                },
                files: {
                    'app/styles/css/main.css': 'app/styles/sass/style.scss',
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');

    // Default task.
    grunt.registerTask('default', ['sass:dist']);

};
