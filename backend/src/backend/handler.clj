(ns backend.handler
  (:require [clojure.java.io :as io]
            [compojure.core :refer :all]
            [clojure.data.json :as json]
            [compojure.route :as route]
            [compojure.handler :as handler]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [ring.middleware.session :refer [wrap-session]]
            [ring.util.response :as resp]
            [ring.adapter.jetty :refer [run-jetty]]
            [cemerick.friend :as friend]
            (cemerick.friend [workflows :as workflows]
                             [credentials :as creds])
            [hiccup.core :refer [html]]
            [hiccup.page :as h] 
            [backend.queries :as q])
  (:gen-class))


(def base-path "/home/josep/Repositories/atd-editor/atd-editor/frontend/build/")

(def login-form
  (html
   [:html
    [:head
     [:link {:rel "stylesheet"
             :href "bootstrap.min.css"
             :integrity "sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
             :crossorigin "anonymous"}]]
    [:body {:style "margin:100px"}
     [:h1 {:style "text-align:center"} "The Model Judge Exercise Editor"]
     [:div {:class "center-block" :style "width:15em;margin-top:10em"}
      [:div {:class "row"}
       [:h3 {:style "text-align:center;margin-bottom:50px"} "Please Log In:"]
       [:form {:method "POST" :action "login" :class "columns small-4"}
        [:div
         [:div {:class "col-md-6"} "Username"]
         [:div {:class "col-md-6"} [:input {:type "text" :name "username"}]]]
        [:div
         [:div {:class "col-md-6"} "Password"]
         [:div {:class "col-md-6"} [:input {:type "password" :name "password"}]]]
        [:div {:style "padding-top:80px"}
         [:input {:type "submit" :class "center-block button" :value "Login"}]]]]]
     [:h3 {:style "text-align:center;margin-bottom:50px"} "Or register at " [:a {:href "http://modeljudge.cs.upc.edu"} "ModelJudge"]]
     ]]))


(defroutes app-routes
  (GET "/" [] (friend/authenticated
               (io/file base-path "index.html")))
  (GET "/login" [] login-form)
  (GET "/static/js/:script" [script] (friend/authenticated
                                      (io/file base-path "static" "js" script)))
  (GET "/static/css/:style" [style] (friend/authenticated
                                     (io/file base-path "static" "css" style)))
  (GET "/service-worker.js" [] (friend/authenticated
                                (io/file base-path "service-worker.js")))
  (GET "/react-contextmenu.css" [] (friend/authenticated
                                    (io/file base-path "react-contextmenu.css")))
  (GET "/api/test-endpoint" [] (friend/authenticated
                                "{\"hello\": \"world\"}"))
  (GET "/api/getUserName" {session :session}
       (friend/authenticated (:current friend/*identity*)))
  (GET "/logout" req
       (friend/logout (ANY "/logout" request login-form)))
  (POST "/api/save" {body :body} (friend/authenticated
                                  (do (spit "./savedata.json" (slurp body))
                                      "{\"status\": \"ok\"}")))
  (GET "/api/load" [] (friend/authenticated
                       (json/write-str {:status "ok"
                                        :data (slurp "./savedata.json")})))
  (GET "/api/getText" [] (friend/authenticated
                          (slurp "./text.txt")))
  (GET "/bootstrap.min.css" [] (io/file "./bootstrap.min.css"))
  (route/not-found "Not Found"))


(def app
  (handler/site
   (friend/authenticate
    (wrap-defaults
     app-routes
     (assoc-in site-defaults [:security :anti-forgery] false))
    {:allow-anon true
     :login-uri "/login"
     :credential-fn q/validate-user
     :unauthorized-handler #(-> (h/html5 [:h2 "You do not have sufficient privileges to access " (:uri %)])
                                resp/response
                                (resp/status 401))
     :workflows [(workflows/interactive-form)]})))

(defn -main [& [base-path port & _]]
  (assert (and base-path (.exists (io/file base-path)))
          "First argument must be the frontend path")
  (assert (or (not port)
              (re-matches #"\d+" port))
          "Second argument, if present, must be the port number")
  (println (format "Serving %s at port %s" base-path port))
  (def base-path base-path)
  (run-jetty app {:port (or (and port (Integer/parseInt port))
                            3000)}))
