
module.exports = function(grunt) {
    require('jit-grunt')(grunt);
	
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
		copy: {
			css: {
				src: 'Resources/Private/Css/print.css',
				dest: 'Resources/Public/Css/print.css'
			},
			css2: {
				src: 'Resources/Private/Css/landingpage.css',
				dest: 'Resources/Public/Css/landingpage.css'
			},
			js: {
				expand: true,
				cwd: 'Resources/Private/JavaScript/',
				src: '**',
				dest: 'Resources/Public/JavaScript/'
			}
		},
        cssmin: {
			dev: {
			  	options: {
			    	mergeIntoShorthands: false,
					format: 'beautify',
					level: 0
				},
			    files: {
			      "Resources/Public/Css/Styles.css": ["Resources/Private/Css/Styles.css","Resources/Private/Css/overrides.css"]
			    }
			},
            prod:{
                files: {
                    "Resources/Public/Css/Styles.css" : ["Resources/Private/Css/Styles.css","Resources/Private/Css/overrides.css"],
					"Resources/Public/Css/landingpage.css" : "Resources/Private/Css/landingpage.css",
					"Resources/Public/Css/print.css" : "Resources/Private/Css/print.css",
                }
            }
        },
		uglify: {
			prod: {
                options: {
                    compress: true,
                    preserveComments: false,
                    yuicompress: true,
                    optimization: 2
                },
                files: [{
					expand: true,
					cwd: 'Resources/Private/JavaScript/',
					src: ['**/*.js', '!libs/*.js'],
					dest: 'Resources/Public/JavaScript/'/*,
					rename: function (dst, src) {
						// rename foo.js --> foo.min.js
						return dst + '/' + src.replace('.js', '.min.js');
					}*/
				}]
            }
        },
        watch: {
            styles: {
                files: ['Resources/Private/Css/Styles.css', 'Resources/Private/Css/landingpage.css', 'Resources/Private/Css/overrides.css','Resources/Private/Css/print.css'],
                tasks: ['copy', 'cssmin:dev'],
                options: {
                    nospawn: true
                }
            },
			js: {
                files: ['Resources/Private/JavaScript/*.js', 'Resources/Private/JavaScript/localization/*.js', 'Resources/Private/JavaScript/pages/*.js'],
                tasks: ['copy']
            }
        }
    });
	
    grunt.registerTask('default', ['copy', "cssmin:dev",  'watch']);
	grunt.registerTask('buildProd', ['cssmin:prod','uglify:prod']);
};
