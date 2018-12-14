import json
import plotly.plotly as py
import plotly.graph_objs as go
import plotly.io as pio
import os
import bisect
from plotly.offline import init_notebook_mode, plot_mpl
import matplotlib.pyplot as plt
import collections
import plotly
from plotly.offline import iplot, init_notebook_mode

plotly.tools.set_credentials_file(username='USERNAME', api_key='KEY')


agents_total=[]
time_total=[]
max_txs=[]
avg_time_list={}


for log in os.listdir("../Backend/logs/GT"):
    if log.endswith("json"):
        with open("../Backend/logs/GT/"+log, "r") as read_file:
            what = json.load(read_file)
            txs=[]
            tc=[]
            agents = int(what["inputs"]["agents"])
            ctime = float(what["timeElapsedTotal"]/1000)
            #print(log," ",agents, ctime)
            position = bisect.bisect_left(agents_total, agents)
            bisect.insort_left(agents_total, agents)
            time_total.insert(position, ctime)


            many = int(len(what["transactions"]))
            max=0
            

            for x in range(100, many-1):


                tc.append(float(what["transactions"][x]["totalTransactionCounter"]))
                txs.append(float(what["transactions"][x]["txs"]))
                if max < float(what["transactions"][x]["txs"]):
                    max = float(what["transactions"][x]["txs"])
                
            
            max_txs.insert(position, max)



            fig = go.Figure()
            fig.add_scatter(x=tc,
                            y=txs,
                            mode='markers',
                            line = dict(
                            color = ('rgb(22, 96, 167)'),
                            width = 1)
                                )
            pio.write_image(fig, "../Backend/images/GT"+log+".svg")


# black magic


agents_unique=sorted(set(agents_total))

counter=collections.Counter(agents_total)

for r in agents_unique:
    l=[]
    for position, item in enumerate(agents_total):
        if item == r:
            l.append(position)
        sum=0
        for z in l:
         sum=sum+int(time_total[z])
         avg_time_list.update({int(r):sum/counter[r]})


avgagent=list(avg_time_list.keys())
avgtime=list(avg_time_list.values())




trace = go.Scatter(
    x = time_total,
    y = agents_total,
    mode = 'markers'
)

data = [trace]

# Plot and embed in ipython notebook!
layout= go.Layout(
    title= 'Time to Convergence',
    xaxis= dict(
        title= 'Time Elapsed (seconds)',
        ticklen= 5,
        zeroline= False,
        gridwidth= 2,
    ),
    yaxis=dict(
        title= 'Number of Agents',
        ticklen= 5,
        gridwidth= 2,
    )
)
fig= go.Figure(data=data, layout=layout)
py.plot(fig, filename='ConvergenceGT')


trace2 = go.Scatter(
    x = agents_total,
    y = max_txs,
    mode = 'markers'
)

data2 = [trace2]

# Plot and embed in ipython notebook!
layout2= go.Layout(
    title= 'Max Txs',
    xaxis= dict(
        title= 'Number of Agents',
        ticklen= 5,
        zeroline= False,
        gridwidth= 2,
    ),
    yaxis=dict(
        title= 'Txs',
        ticklen= 5,
        gridwidth= 2,
    )
)
fig2= go.Figure(data=data2, layout=layout2)
py.plot(fig2, filename='MaxTxsGT')



trace4 = go.Scatter(
    x = avgtime,
    y = avgagent,
    mode = 'lines'
)

data4 = [trace4]

# Plot and embed in ipython notebook!
layout4= go.Layout(
    title= 'Average Time to Convergence',
    xaxis= dict(
        title= ' Average Time Elapsed (seconds)',
        ticklen= 5,
        zeroline= False,
        gridwidth= 2,
    ),
    yaxis=dict(
        title= 'Number of Agents',
        ticklen= 5,
        gridwidth= 2,
    )
)
fig4= go.Figure(data=data4, layout=layout4)
py.plot(fig4, filename='AvgTimeGT')


# this is just for fun

# trace3 = go.Scatter3d(
#     x = time_total,
#     y = agents_total,
#     z = max_txs,
#     mode = 'markers'
# )
# data3 = [trace3]

# # Plot and embed in ipython notebook!
# layout3= go.Layout(
#     title= 'Mission',
#     scene = dict(
#     xaxis= dict(
#         title= 'Time to Converge',
#         ticklen= 5,
#         gridwidth= 2,
#         zeroline= False
#     ),
#         yaxis=dict(
#         title= 'Number of Agents',
#         ticklen= 5,
#         gridwidth= 2,
#     ),
#     zaxis=dict(
#         title= 'Max Txs',
#         ticklen= 5,
#         gridwidth= 2,
#     )
    
#     )
# )

# fig3= go.Figure(data=data3, layout=layout3)
# py.plot(fig3, filename='MissionGT')