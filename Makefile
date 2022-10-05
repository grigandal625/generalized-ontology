HOST := $$(ifconfig | grep 'netmask 255.255.255.0' | awk '{print $$2}')
PORT := 1844

serve:
	bundle exec rails server -b ${HOST} -p ${PORT}
ip:
	ifconfig | grep 'netmask 255.255.255.0' | awk '{print $$2}'
start:
	bundle exec rails server -b ${HOST} -p ${PORT} -d
stop:
	kill -9 $$(cat tmp/pids/server.pid)