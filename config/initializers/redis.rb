rails_root = ENV['RAILS_ROOT'] || File.dirname(__FILE__) + '/../..'
rails_env = ENV['RAILS_ENV'] || 'development'

redis_config = YAML.load(ERB.new(File.read("#{rails_root}/config/redis.yml")).result)[rails_env]

$user_matches = Redis::Namespace.new('user-matches', :redis => Redis.new(:host => redis_config[:host], :port => redis_config[:port]))