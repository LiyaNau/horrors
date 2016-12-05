import tmdbsimple as tmdb
import pandas as pd
import time
import sys
from urllib2 import URLError
from requests import ConnectionError, HTTPError, RequestException
tmdb.API_KEY = '1a727572418bcfe16be8263b6a271737'


def load_movies(path):
    genre_id = 27
    genres = tmdb.Genres(id=genre_id)
    films = genres.movies()
    total_pages = films['total_pages']
    results = films['results']
    print len(results)

    df = pd.DataFrame(results)

    for n_page in range(2, total_pages + 1):
        response = genres.movies(page=n_page)
        df = df.append(response['results'], ignore_index=True)
        if n_page % 10 == 0:
            time.sleep(1)
            print n_page

        if n_page % 20 == 0:
            df.to_pickle(path)

    df.drop(['video', 'poster_path', 'popularity', 'overview', 'original_title',
             'backdrop_path', 'adult', 'genre_ids'], axis=1, inplace=True)
    print df.head(), df.shape
    df.to_pickle(path)


def load_tags(path_movies, path_tags, n = 0):

    movies = pd.read_pickle(path_movies)
    ids = movies['id']
    tags = pd.DataFrame()

    for i in range(n,n+1000):
        id = ids.iloc[i]

        req = tmdb.Movies(id)
        response = []
        try:
            response = req.keywords()['keywords']
        except RequestException, e:
            #e = sys.exc_info()[0]
            print  "<p>Error: %s, id: %s</p>" % (e, id)
        except ConnectionError, e:
            print  "<p>Error: %s, id: %s</p>" % (e, id)
        except HTTPError, e:
            print  "<p>Error: %s, id: %s</p>" % (e, id)


        if len(response) > 0:
            for tag in response:
                tag['movie_id'] = id
            if len(tags) == 0:
                tags = tags.from_dict(response)
            else:
                tags = tags.append(response, ignore_index=True)

        if i % 10 == 0:
            time.sleep(1)
            print i
        if i % 100 == 0:
            tags.to_pickle("tags_part%s.pkl" % n)


    print tags.head()
    tags.to_pickle("tags_part%s.pkl" % n)


def combine(path_movies, path_tags):

    movies = pd.read_pickle(path_movies)
    tags = pd.DataFrame()
    for i in range(14):
        path = "tags_part%s000.pkl" % i
        part = pd.read_pickle(path)
        tags = pd.concat([tags,part],axis=0)

    tags['tag_id'] = tags['id']
    tags.drop('id', inplace=True, axis=1)

    tags['id'] = tags['movie_id']
    tags.drop('movie_id', axis=1, inplace=True)

    movies = pd.merge(movies, tags, how='inner', on='id')

    #print movies['release_date']
    movies['year'] = movies['release_date'].str[0:4]
    movies['year_bucket'] = movies['year'].str[0:3] + '0'
    #
    print movies.head(20)
    movies.to_pickle('data_full.pkl')
    movies.to_csv("data_full.csv", encoding='utf-8')

    movies.drop(["vote_average","vote_count","original_language","release_date"],
                inplace=True, axis=1)
    counts = pd.value_counts(movies.name)
    tag_list = list(counts[counts >= 5].index)
    movies = movies[movies.name.isin(tag_list)]


    movies.to_csv("data.csv", encoding='utf-8')
    movies.to_pickle("data.pkl")

    print tags.shape
    print movies.shape


# load_movies('movies.pkl')

#load_tags('movies.pkl','tags',13000)

combine('movies.pkl', 'tags.pkl')
