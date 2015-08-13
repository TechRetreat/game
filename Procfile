web: bundle exec rails server -p $PORT -e $RACK_ENV
worker: QUEUE=* COUNT='25' rake environment resque:workers
