rails_root = ENV['RAILS_ROOT'] || File.dirname(__FILE__) + '/../..'
rails_env = ENV['RAILS_ENV'] || 'development'

redis_config = YAML.load(ERB.new(File.read("#{rails_root}/config/redis.yml")).result)[rails_env]
Resque.redis = "#{redis_config[:host]}:#{redis_config[:port]}"

# Redis status expiry time
Resque::Plugins::Status::Hash.expire_in = (24 * 60 * 60) # 24hrs in seconds