web: bundle exec rails server -p $PORT -e $RACK_ENV
worker: QUEUE=* rake environment resque:work -c='./.resque'
