(defproject backend "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :min-lein-version "2.0.0"
  :dependencies [[org.clojure/clojure "1.9.0"]
                 [compojure "1.6.1"]
                 [ring/ring-defaults "0.3.2"]
                 [ring/ring-jetty-adapter "1.6.3"]
                 [com.cemerick/friend "0.2.3"]
                 [org.clojure/java.jdbc "0.7.8"]
                 [mysql/mysql-connector-java "8.0.12"]
                 [org.clojure/data.json "0.2.6"]]
  :plugins [[lein-ring "0.12.4"]]
  :ring {:handler backend.handler/app}
  :jvm-opts ["-Duser.timezone=UTC"]
  :main backend.handler
  :profiles
  {:dev {:dependencies [[javax.servlet/javax.servlet-api "3.1.0"]
                        [ring/ring-mock "0.3.2"]]}})
