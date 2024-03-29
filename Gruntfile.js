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
                options: {
                    sourcemap: 'none'
                },
                //TODO: decide whether to concat or dynamically load modules.
                files: [{
                    expand: true,
                    cwd: 'app/styles/sass/',
                    src: ['**/*.scss'],
                    dest: 'app/styles/css',
                    ext: '.css'
                }]
            }
        },
        watch: {
            options: {
                nospawn: true,
                livereload: true
            },
            sass: {
                files: ['app/styles/sass/**/*.scss'],
                tasks: ['sass:dist']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');

    // Default task.
    grunt.registerTask('default', ['sass:dist']);

};
