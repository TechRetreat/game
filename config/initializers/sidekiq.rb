rails_root = ENV['RAILS_ROOT'] || File.dirname(__FILE__) + '/../..'
rails_env = ENV['RAILS_ENV'] || 'development'

redis_config = YAML.load(ERB.new(File.read("#{rails_root}/config/redis.yml")).result)[rails_env]

Sidekiq.configure_server do |config|
  config.redis = { url: "redis://#{redis_config[:host]}:#{redis_config[:port]}/0", namespace: 'rtanque' }
end

Sidekiq.configure_client do |config|
  config.redis = { url: "redis://#{redis_config[:host]}:#{redis_config[:port]}/0", namespace: 'rtanque' }
end
