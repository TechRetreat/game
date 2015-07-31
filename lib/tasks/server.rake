task :redis do
  sh("redis-server&")
end

task :rails do
  sh("bin/rails server -d")
end

task :resque => :environment do
  ENV['QUEUE'] = '*'
  ENV['VVERBOSE'] = '1'
  Rake::Task['resque:work'].invoke
end

desc "Run all the server components"
task :server => [:redis, :rails, :resque] do
end

desc "Stop all the server components"
task :stop do
  sh("redis-cli shutdown")
  pid_file = 'tmp/pids/server.pid'
  pid = File.read(pid_file).to_i
  Process.kill 9, pid
  File.delete pid_file
end
