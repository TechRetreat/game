# T(ech)R(etreat)anque

An online AI game using RTanque

## Running
### OS X Setup
- Any version of ruby from 2.0 up should be fine, tested with version 2.0 system ruby and version 2.2.2 from rvm
- Install redis `brew install redis`

### Windows Setup
- Install ruby 2.2.2 and the DevKit from [RubyInstaller](http://rubyinstaller.org/downloads/)
- Install redis from [MSOpenTech](https://github.com/MSOpenTech/redis)

### Next steps
- install dependencies with `bundle install`
- setup the database with `rake db:create` and `rake db:migrate`
- on *nix, run `rake server` to start everything, or manually:
  - run redis `redis-server`
  - run the server with `rails c`
  - run resque with `QUEUE=* rake environment resque:work`
