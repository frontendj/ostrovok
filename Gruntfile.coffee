module.exports = (grunt) ->
  'use strict'

  require('load-grunt-tasks')(grunt)

  debug = !!grunt.option('debug')
  prefix = if debug then '' else '/ostrovok/'

  grunt.initConfig

    coffee:
      compile:
        files:
          'build/js/core.js': ['src/js/main_page.coffee', 'src/js/app.coffee']

    slim:
      dist:
        files:
          'index.html': 'src/slim/index.slim'

    compass:
      dist:
        options:
          sassDir: 'src/sass'
          cssDir: 'build/css'
          environment: 'development'
          outputStyle: 'expanded'


    replace:

      version:
        files:
          'index.html': 'index.html'
        options:
          patterns: [
            {
              match: /(\.js|\.css)[^"]*/gi
              replacement: '$1?<%= grunt.template.today("yyyymmddHHMM") %>'
            }
            {
              match: /"build/gi
              replacement: '"'+prefix+'build'
            }
          ]

      jquery_ui_images:
        files:
          'build/css/core.css': 'build/css/core.css'
        options:
          patterns: [
            {
              match: /url\("images/gi
              replacement: 'url("../img/jqueryui'
            }
          ]
    copy:
      main:
        files: [
          {
            expand: true
            src: ["src/img/*"]
            dest: "build/img"
            filter: "isFile"
            flatten: true
          }
          {
            expand: true
            src: ["src/img/jqueryui/*"]
            dest: "build/img/jqueryui"
            filter: "isFile"
            flatten: true
          }
          {
            expand: true
            src: ["src/js/*.js"]
            dest: "build/js"
            filter: "isFile"
            flatten: true
          }
          {
            expand: true
            src: ["src/js/*.json"]
            dest: "build/js"
            filter: "isFile"
            flatten: true
          }
        ]

    watch:
      compass:
        options:
          atBegin: true
        files: ['src/sass/**']
        tasks: ['compass']
      slim:
        options:
          atBegin: true
        files: ['src/slim/*']
        tasks: ['slim']
      coffee:
        options:
          atBegin: true
        files: ['src/js/**']
        tasks: ['coffee']
      copy:
        options:
          atBegin: true
        files: ['src/img/*']
        tasks: ['copy']
      replace:
        options:
          atBegin: true
        files: ['build/css/core.css']
        tasks: ['replace:jquery_ui_images']

  grunt.registerTask 'build', ['coffee', 'slim', 'compass', 'replace']
