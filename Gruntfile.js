module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compass: {
      dist: {
        options: {
          sassDir: 'sass',
          cssDir: 'css'
        }
      }
    },
    jshint: {
      files: ['js/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      css: {
        files: '**/*.scss',
        tasks: ['compass']
      },
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-jshint');  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default',['watch','jshint']);
}