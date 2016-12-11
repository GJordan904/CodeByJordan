(function(){'use strict';

module.exports = function(grunt) {

    require('grunt-task-loader')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Clean Folders
        clean: {
            build: ['dist/js', 'dist/styles', 'dist/index.html', '.tmp/*'],
            dev: ['src/styles/*.css']
        },

        // Copy Files
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['index.html', 'php/*', 'bower_components/please-wait/**/*', 'fonts/*', 'img/video_cover/**/*'],
                    dest: 'dist/'
                }]
            }
        },

        // Make Angular code minification safe
        ngAnnotate: {
             options: {
                 singleQuotes: true
             },
            app: {
                 files: [{
                     src: '.tmp/concat/js/app.js',
                     dest: '.tmp/concat/js/app.js'
                 }]
            }
        },

        // Convert templates to .js and minify html
        ngtemplates: {
            build: {
                cwd: 'src',
                src: 'views/**/**.html',
                dest: '.tmp/templates.js',
                options: {
                    module: 'app',
                    usemin: 'js/app.js',
                    htmlmin: {
                        collapseBooleanAttributes:      true,
                        collapseWhitespace:             true,
                        removeAttributeQuotes:          true,
                        removeEmptyAttributes:          true,
                        removeRedundantAttributes:      true,
                        removeScriptTypeAttributes:     true,
                        removeStyleLinkTypeAttributes:  true
                    }
                }
            }
        },

        // Wire Bower Dependencies and minify them
        wiredep: {
            app: {
                src: ['src/index.html'],
                directory: 'src/bower_components',
                exclude: ['src/bower_components/please-wait']
            }
        },
        useminPrepare: {
            html: 'src/index.html',
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: ['dist/index.html']
        },
        uglify: {
            generated: {
                options: {
                    sourceMap: true
                }
            }
        },

        // Compile SCSS to CSS
        sass: {
            build: {
                files: {
                    '.tmp/styles/main.css': 'src/styles/main.scss'
                }
            },
            dev: {
                options: {
                    trace: true
                },
                files: {
                    'src/styles/main.css': 'src/styles/main.scss'
                }
            }
        },

        // Post process CSS
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({browsers: ['last 2 versions']}),
                    require('css-mqpacker')(),
                    require('cssnano')()
                ]
            },
            main: {
                src: '.tmp/styles/main.css',
                dest: 'dist/styles/main.css'
            },
            vendor: {
                src: '.tmp/concat/styles/vendor.css',
                dest: 'dist/styles/vendor.css'
            }
        },

        // Check for JS errors
        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                force: true
            },
            all: ['Gruntfile.js', 'src/js/*.js', 'src/app.js']
        },

        // Minify images
        imagemin: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'dist/',
                    base: 'src'
                }]
            }
        },

        // Development Server
        connect: {
            dev: {
                options: {
                    port: 9000,
                    livereload: true,
                    open: true,
                    base: 'src'
                }
            },
            build: {
                options: {
                    port: 9000,
                    livereload: true,
                    open: true,
                    base: 'dist'
                }
            }
        },

        // Watch for changes
        watch: {
            options: {
                livereload: true
            },
            js: {
                files: ['src/**/*.js'],
                tasks: ['jshint']
            },
            sass: {
                files: ['src/styles/*.scss'],
                tasks: ['clean:dev', 'sass:dev']
            },
            html: {
                files: ['src/**/*.html']
            },
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            }
        }

    });
    // Load tasks not loaded by grunt task loader
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-angular-templates');

    // Register Tasks
    grunt.registerTask('default', [
        'sass:dev',
        'jshint'
    ]);

    grunt.registerTask('build', [
        'clean:build',
        'useminPrepare',
        'ngtemplates',
        'sass:build',
        'concat',
        'postcss',
        'ngAnnotate',
        'uglify',
        'newer:imagemin',
        'copy',
        'usemin'
    ]);

    grunt.registerTask('dev', [
        'clean:dev',
        'wiredep',
        'sass:dev',
        'jshint',
        'connect:dev',
        'watch'
    ]);

    grunt.registerTask('serveBuild', [
        'connect:build',
        'watch'
    ]);
};
}());