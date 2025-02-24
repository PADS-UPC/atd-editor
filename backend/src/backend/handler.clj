(ns backend.handler
  (:require [clojure.java.io :as io]
            [compojure.core :refer :all]
            [clojure.data.json :as json]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))

(def base-path "/home/josep/Repositories/atd-editor/atd-editor/build/")

(defroutes app-routes
  (GET "/" [] (io/file base-path "index.html"))
  (GET "/static/js/:script" [script] (io/file base-path "static" "js" script))
  (GET "/static/css/:style" [style] (io/file base-path "static" "css" style))
  (GET "/service-worker.js" [] (io/file base-path "service-worker.js"))
  (GET "/react-contextmenu.css" [] (io/file base-path "react-contextmenu.css"))
  (GET "/api/test-endpoint" [] "{\"hello\": \"world\"}")
  (POST "/api/save" {body :body} (do (spit "./savedata.json" (slurp body))
                                     "{\"status\": \"ok\"}"))
  (GET "/api/load" [] (json/write-str {:status "ok"
                                       :data (slurp "./savedata.json")}))
  (GET "/api/getText" [] (slurp "./text.txt"))
  (route/not-found "Not Found"))

(def app
  (wrap-defaults app-routes (assoc-in site-defaults [:security :anti-forgery] false)))
