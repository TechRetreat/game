web: bundle exec rails server -p $PORT -e $RACK_ENV
worker: QUEUE=* COUNT='10' rake environment resque:workers
