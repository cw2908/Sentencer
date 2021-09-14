require 'json'

files = Dir[File.join(Dir.pwd,'dict/**/*.txt')]

files.each do |file|
  path, filename = file.split('/').last(2)
  file_contains = filename.scan(/(?<=\s)\w*/).first
  word_list = File.read(file).split(/\n/).map(&:strip)
  puts "Writing #{word_list.count} words as #{file_contains}.json"
  File.open(File.join(Dir.pwd,'words',"#{file_contains}.js"), 'w+') do |f|
    f << "module.exports = #{word_list}"
  end
end
