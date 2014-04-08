# Require any additional compass plugins here.

require 'sass-globbing'

# Set this to the root of your project when deployed:

http_path = "/"
css_dir = "css"
css_path = "build/css"
sass_dir = "sass"
sass_path = "src/sass"
images_dir = "img"
images_path = "src/img"
generated_images_path = "build/img"
javascripts_dir = "js"
http_generated_images_path = "../img"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = :expanded

# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass

module Sass::Script::Functions
  def file_exists(image_file)
    path = image_file.value
    Sass::Script::Bool.new(File.exists?(path))
  end
end