desc "Run all the server components"
task :server => :environment do
  sh("redis-server&")
  sh("bin/rails server -d")
  ENV['QUEUE'] = '*'
  Rake::Task['resque:work'].invoke
end
