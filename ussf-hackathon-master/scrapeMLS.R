
# load libraries
library(stringr)
library(rvest)


## get regular season

# create list of dfs for each page
dfs = list()

for(i in 0:23){
  
  # load webpage
  url = paste0('http://www.mlssoccer.com/stats/season?year=2017&page=',
               i)
  webpage = read_html(url)
  
  # get rows
  rows = webpage %>% html_nodes('div#main')  %>% html_nodes('tr')
  
  # create variables
  Name = rep(NA, length(rows) - 1)
  Minutes = rep(NA, length(rows) - 1)
  Goals = rep(NA, length(rows) - 1)
  Assists = rep(NA, length(rows) - 1)
  
  # fill variables
  for(j in 2:length(rows)){
    
    Name[j - 1] = (rows[j] %>% html_nodes('td'))[1] %>% html_text()
    Minutes[j - 1] = as.numeric((rows[j] %>% html_nodes('td'))[6] %>% html_text())
    Goals[j - 1] = as.numeric((rows[j] %>% html_nodes('td'))[7] %>% html_text())
    Assists[j - 1] = as.numeric((rows[j] %>% html_nodes('td'))[8] %>% html_text())
    
  }
  
  # create data frame
  df = data.frame(Name,
                  Minutes,
                  Goals,
                  Assists)
  
  dfs[[i + 1]] = df
  
}

# combine data frames
regSeason = dfs[[1]]
for(i in 2:24) regSeason = rbind(regSeason, dfs[[i]])



## get playoffs

# create list of dfs for each page
dfs = list()

for(i in 0:23){
  
  # load webpage
  url = paste0('http://www.mlssoccer.com/stats/season?year=2017&season_type=PS&page=',
               i)
  webpage = read_html(url)
  
  # get rows
  rows = webpage %>% html_nodes('div#main')  %>% html_nodes('tr')
  
  # create variables
  Name = rep(NA, length(rows) - 1)
  Minutes = rep(NA, length(rows) - 1)
  Goals = rep(NA, length(rows) - 1)
  Assists = rep(NA, length(rows) - 1)
  
  # fill variables
  for(j in 2:length(rows)){
    
    Name[j - 1] = (rows[j] %>% html_nodes('td'))[1] %>% html_text()
    Minutes[j - 1] = as.numeric((rows[j] %>% html_nodes('td'))[5] %>% html_text())
    Goals[j - 1] = as.numeric((rows[j] %>% html_nodes('td'))[6] %>% html_text())
    Assists[j - 1] = as.numeric((rows[j] %>% html_nodes('td'))[7] %>% html_text())
    
  }
  
  # create data frame
  df = data.frame(Name,
                  Minutes,
                  Goals,
                  Assists)
  
  dfs[[i + 1]] = df
  
}

# combine data frames
postSeason = dfs[[1]]
for(i in 2:24) postSeason = rbind(postSeason, dfs[[i]])


## combine regular and post seasons
fullSeason = regSeason

fullSeason$minutesPostSeason = rep(NA, nrow(fullSeason))
fullSeason$goalsPostSeason = rep(NA, nrow(fullSeason))
fullSeason$assistsPostSeason = rep(NA, nrow(fullSeason))

for(i in 1:nrow(fullSeason)){
  
  fullSeason$minutesPostSeason[i] = postSeason$Minutes[postSeason$Name == fullSeason$Name[i]]
  fullSeason$goalsPostSeason[i] = postSeason$Goals[postSeason$Name == fullSeason$Name[i]]
  fullSeason$assistsPostSeason[i] = postSeason$Assists[postSeason$Name == fullSeason$Name[i]]
  
}

fullSeason[is.na(fullSeason)] = 0

colnames(fullSeason)[2:4] = c('minutesRegSeason',
                              'goalsRegSeason',
                              'assistsRegSeason')

fullSeason$totalMinutes = fullSeason$minutesRegSeason + fullSeason$minutesPostSeason
fullSeason$totalGoals = fullSeason$goalsRegSeason + fullSeason$goalsPostSeason
fullSeason$totalAssists = fullSeason$assistsRegSeason + fullSeason$assistsPostSeason

setwd('/Users/brendan/Downloads')
write.csv(fullSeason,
          'MLS Minutes Goals Assists 2017.csv',
          row.names = FALSE)

