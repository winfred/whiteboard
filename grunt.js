module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
		concat: {
			dist: {
				src: ['lib/*.js', 'lib/*/*.js', 'lib/**/*.js'],
				dest: 'build/whiteboard.js'
			}
		},
    lint: {
      all: ['grunt.js', 'lib/**/*.js','test/**/*.js']
    },
    jshint: {
      options: {
        browser: true
      }
    },
		min: {
      dist: {
        src:  '<config:concat.dist.dest>',
        dest: 'build/whiteboard.min.js'
      }
		},	
		watch: {
			files: '<config:concat.dist.src>',
			tasks: 'concat'
		}
  });
  // Default task.
  grunt.registerTask('default', 'concat min');

};
